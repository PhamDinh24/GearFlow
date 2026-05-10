package com.gearflow.service;

import com.gearflow.dto.PaymentDTO;
import com.gearflow.entity.Order;
import com.gearflow.entity.Payment;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductService productService;

    @Value("${vnpay.tmnCode:}")
    private String vnpayTmnCodeRaw;

    @Value("${vnpay.hashSecret:}")
    private String vnpayHashSecretRaw;

    @Value("${vnpay.apiUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayApiUrlRaw;

    @Value("${vnpay.returnUrl:http://localhost:5173/payment-result}")
    private String vnpayReturnUrlRaw;

    // Trimmed values to remove any whitespace
    public String getVnpayTmnCode() {
        return vnpayTmnCodeRaw.trim();
    }

    public String getVnpayHashSecret() {
        return vnpayHashSecretRaw.trim();
    }

    public String getVnpayApiUrl() {
        return vnpayApiUrlRaw.trim();
    }

    public String getVnpayReturnUrl() {
        return vnpayReturnUrlRaw.trim();
    }

    @Transactional
    public PaymentDTO createPayment(String orderId, String paymentMethod) {
        log.info("Creating payment for order: {} with method: {}", orderId, paymentMethod);
        
        // Validate inputs
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new BusinessException("Order ID is required");
        }
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            throw new BusinessException("Payment method is required");
        }
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
        if (existingPayment.isPresent()) {
            log.info("Payment already exists for order: {}", orderId);
            return toDTO(existingPayment.get());
        }

        // Parse payment method
        Payment.PaymentMethod method;
        try {
            method = Payment.PaymentMethod.valueOf(paymentMethod.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid payment method: {}", paymentMethod);
            throw new BusinessException("Invalid payment method: " + paymentMethod + ". Valid methods: COD, VNPAY");
        }

        Payment payment = Payment.builder()
                .id(java.util.UUID.randomUUID().toString())
                .orderId(order.getId())
                .paymentMethod(method)
                .status(Payment.PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .build();

        payment = paymentRepository.save(payment);

        // If COD, auto-confirm order and mark COD payment as SUCCESS (pay on delivery)
        if (method == Payment.PaymentMethod.COD) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment = paymentRepository.save(payment);
            
            // Process stock for COD
            for (var item : order.getItems()) {
                productService.decrementStock(item.getVariantId(), item.getQuantity());
                productService.releaseReservedStock(item.getVariantId(), item.getQuantity());
            }
            
            log.info("Order auto-confirmed and COD payment marked success");
        }
        
        log.info("Payment created with ID: {}", payment.getId());
        return toDTO(payment);
    }

    public Map<String, String> generateVNPayRequest(String paymentId, String clientIp) throws UnsupportedEncodingException {
        log.info("Generating VNPay request for payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        // Generate numeric VNPay reference if not already generated
        String vnpayRef = payment.getVnpayRef();
        if (vnpayRef == null || vnpayRef.isEmpty()) {
            vnpayRef = generateNumericReference(payment.getId());
            payment.setVnpayRef(vnpayRef);
            payment = paymentRepository.save(payment);
            log.info("Generated VNPay numeric reference: {}", vnpayRef);
        }

        // Retrieve trimmed config values
        String tmnCode = getVnpayTmnCode();
        String hashSecret = getVnpayHashSecret();
        String apiUrl = getVnpayApiUrl();
        String returnUrl = getVnpayReturnUrl();
        
        String ip = clientIp != null && !clientIp.isEmpty() ? clientIp : "127.0.0.1";
        if (ip.length() > 15) {
            ip = "127.0.0.1"; // VNPay limits IP to 15 chars
        }

        log.debug("VNPay config - TMN: {}, ApiUrl: {}, ReturnUrl: {}", tmnCode, apiUrl, returnUrl);

        // Use TreeMap to auto-sort keys alphabetically (required by VNPay)
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(payment.getAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue()));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpayRef);  // Use numeric reference instead of UUID
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + payment.getOrderId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        
        TimeZone vnTimeZone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(vnTimeZone);
        
        vnpParams.put("vnp_CreateDate", formatter.format(new Date()));
        vnpParams.put("vnp_IpAddr", ip);
        vnpParams.put("vnp_ExpireDate", formatter.format(new Date(System.currentTimeMillis() + 900000)));

        // Step 1: Build sign data with URL-encoded values (VNPay 2.1.0 requirement)
        String signData = buildSignData(vnpParams);
        log.info("VNPay sign data (encoded): {}", signData);
        
        String vnpSecureHash = hmacSHA512(hashSecret, signData);
        log.info("VNPay secure hash: {}", vnpSecureHash);
        
        // Step 2: Build URL with URL-encoded values (for HTTP transport)
        String queryString = buildQueryStringEncoded(vnpParams);
        String paymentUrl = apiUrl + "?" + queryString + "&vnp_SecureHash=" + vnpSecureHash;
        log.info("VNPay payment URL: {}", paymentUrl);
        
        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        
        return result;
    }

    @Transactional
    public PaymentDTO verifyPayment(Map<String, String> params) {
        log.info("Verifying VNPay payment callback with params: {}", params.keySet());
        
        String vnpSecureHash = params.get("vnp_SecureHash");
        String hashSecret = getVnpayHashSecret();
        
        // Build a new TreeMap without hash fields for verification
        // Params from callback are already URL-decoded by Spring (raw values)
        Map<String, String> verifyParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!"vnp_SecureHash".equals(entry.getKey()) && !"vnp_SecureHashType".equals(entry.getKey())) {
                verifyParams.put(entry.getKey(), entry.getValue());
            }
        }

        // Use encoded values for verification (must match the signing logic)
        String signData = buildSignData(verifyParams);
        String computedHash = hmacSHA512(hashSecret, signData);

        log.info("Verify - Received Hash: {}", vnpSecureHash);
        log.info("Verify - Computed Hash: {}", computedHash);

        if (!computedHash.equalsIgnoreCase(vnpSecureHash)) {
            log.error("Payment verification failed - hash mismatch. SignData: {}", signData);
            throw new BusinessException("Invalid payment signature");
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo");
        String vnpayRef = params.get("vnp_TxnRef");  // This is the numeric reference

        // Look up payment using the numeric vnpay reference
        Payment payment = paymentRepository.findByVnpayRef(vnpayRef)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for vnpay ref: " + vnpayRef));

        // Check for duplicate processing
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            log.warn("Payment already processed: {}", payment.getId());
            return toDTO(payment);
        }

        if ("00".equals(responseCode)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(transactionId);
            
            // Update order status to CONFIRMED
            Order order = orderRepository.findById(payment.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
            
            // Process stock for successful payment
            for (var item : order.getItems()) {
                productService.decrementStock(item.getVariantId(), item.getQuantity());
                productService.releaseReservedStock(item.getVariantId(), item.getQuantity());
            }
            
            log.info("Payment verified successfully");
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            
            // Release reserved stock for failed payment
            Order order = orderRepository.findById(payment.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            for (var item : order.getItems()) {
                productService.releaseReservedStock(item.getVariantId(), item.getQuantity());
            }
            
            log.warn("Payment failed with response code: {}", responseCode);
        }

        payment = paymentRepository.save(payment);
        return toDTO(payment);
    }

    public PaymentDTO getPayment(String paymentId) {
        log.info("Fetching payment: {}", paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toDTO(payment);
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Generate a numeric transaction reference from a UUID payment ID.
     * VNPay requires numeric TxnRef, so we convert the hex UUID to a number.
     */
    private String generateNumericReference(String paymentId) {
        // Convert UUID to numeric reference for VNPay (which requires numeric TxnRef)
        // Remove hyphens from UUID and hash to get a numeric string
        String uuidWithoutHyphens = paymentId.replace("-", "");
        
        // Convert hex string to numeric by taking first 16 characters and converting
        long numericRef = 0;
        for (int i = 0; i < Math.min(16, uuidWithoutHyphens.length()); i++) {
            char c = uuidWithoutHyphens.charAt(i);
            numericRef = numericRef * 16 + Integer.parseInt(String.valueOf(c), 16);
            // Keep it under 18 digits to ensure it fits in a long
            if (numericRef > 9999999999999999L) {
                numericRef = numericRef % 9999999999999999L;
            }
        }
        
        // Ensure it's positive and has at least 8 digits
        numericRef = Math.abs(numericRef);
        String result = String.format("%016d", numericRef);
        log.debug("Generated numeric ref from payment ID {}: {}", paymentId, result);
        return result;
    }

    /**
     * Build hash data string for VNPay signature computation.
     * Format: key1=URLEncode(value1)&key2=URLEncode(value2) (sorted by key)
     * Uses US_ASCII charset and keeps '+' for spaces, matching VNPay's official demo.
     */
    private String buildSignData(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            
            // Exclude hash fields and other non-vnp params
            if (!key.startsWith("vnp_") || "vnp_SecureHash".equals(key) || "vnp_SecureHashType".equals(key)) {
                continue;
            }
            
            if (value != null && !value.isEmpty()) {
                if (!first) sb.append("&");
                try {
                    sb.append(key).append("=");
                    // VNPay official: URLEncoder.encode with US_ASCII, keep '+' for spaces
                    sb.append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    log.error("Encoding error for field: {}", key, e);
                }
                first = false;
            }
        }
        return sb.toString();
    }

    /**
     * Build URL query string with URL-encoded values.
     * This is used for the actual HTTP redirect URL.
     * Format: key1=encoded1&key2=encoded2 (sorted by key, values URL-encoded)
     */
    private String buildQueryStringEncoded(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if ("vnp_SecureHash".equals(key) || "vnp_SecureHashType".equals(key) || "vnp_ApiUrl".equals(key)) {
                continue;
            }
            if (value != null && !value.isEmpty()) {
                if (!first) sb.append("&");
                try {
                    sb.append(URLEncoder.encode(key, StandardCharsets.US_ASCII.toString()));
                    sb.append("=");
                    sb.append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    log.error("Encoding error for field: {}", key, e);
                }
                first = false;
            }
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("Error computing HMAC SHA512", e);
            throw new BusinessException("Error computing payment signature");
        }
    }

    private PaymentDTO toDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .paymentMethod(payment.getPaymentMethod().toString())
                .status(payment.getStatus().toString())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
