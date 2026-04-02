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

    @Value("${vnpay.tmnCode:}")
    private String vnpayTmnCode;

    @Value("${vnpay.hashSecret:}")
    private String vnpayHashSecret;

    @Value("${vnpay.apiUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayApiUrl;

    @Value("${vnpay.returnUrl:http://localhost:5173/payment-result}")
    private String vnpayReturnUrl;

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
            log.info("Order auto-confirmed and COD payment marked success");
        }
        
        log.info("Payment created with ID: {}", payment.getId());
        return toDTO(payment);
    }

    public Map<String, String> generateVNPayRequest(String paymentId) throws UnsupportedEncodingException {
        log.info("Generating VNPay request for payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(payment.getAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue()));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", payment.getOrderId());
        vnpParams.put("vnp_OrderInfo", "Payment for order " + payment.getOrderId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl);
        vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
        vnpParams.put("vnp_ExpireDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date(System.currentTimeMillis() + 900000)));

        String signData = buildSignData(vnpParams);
        log.debug("Sign data for payment {}: {}", paymentId, signData);
        
        String vnpSecureHash = hmacSHA512(vnpayHashSecret, signData);
        log.debug("Generated VNPay hash: {}", vnpSecureHash.substring(0, Math.min(16, vnpSecureHash.length())) + "...");
        
        Map<String, String> result = new HashMap<>(vnpParams);
        result.put("vnp_SecureHash", vnpSecureHash);
        result.put("vnp_SecureHashType", "SHA512");
        result.put("vnp_ApiUrl", vnpayApiUrl);
        
        log.info("VNPay request generated for order: {}, amount: {}, TMN: {}", 
            payment.getOrderId(), payment.getAmount(), vnpayTmnCode);
        return result;
    }

    @Transactional
    public PaymentDTO verifyPayment(Map<String, String> params) {
        log.info("Verifying VNPay payment callback");
        
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String signData = buildSignData(new TreeMap<>(params));
        String computedHash = hmacSHA512(vnpayHashSecret, signData);

        if (!computedHash.equals(vnpSecureHash)) {
            throw new BusinessException("Invalid payment signature");
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo");
        String orderId = params.get("vnp_TxnRef");

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

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
            
            log.info("Payment verified successfully");
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
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

    private String buildSignData(Map<String, String> params) {
        StringBuilder signData = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (signData.length() > 0) {
                signData.append("&");
            }
            signData.append(entry.getKey()).append("=").append(entry.getValue());
        }
        return signData.toString();
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
