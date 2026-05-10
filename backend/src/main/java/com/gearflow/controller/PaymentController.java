package com.gearflow.controller;

import com.gearflow.dto.PaymentDTO;
import com.gearflow.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody CreatePaymentRequest request) {
        log.info("POST /api/payment - Order: {}, Method: {}", request.getOrderId(), request.getPaymentMethod());
        PaymentDTO payment = paymentService.createPayment(request.getOrderId(), request.getPaymentMethod());
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/{paymentId}/vnpay-url")
    public ResponseEntity<Map<String, String>> getVNPayUrl(@PathVariable String paymentId, HttpServletRequest request) throws UnsupportedEncodingException {
        log.info("GET /api/payment/{}/vnpay-url", paymentId);
        String clientIp = getClientIp(request);
        Map<String, String> vnpayParams = paymentService.generateVNPayRequest(paymentId, clientIp);
        return ResponseEntity.ok(vnpayParams);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Get first IP if multiple IPs are present (X-Forwarded-For can have multiple)
        if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentDTO> getPayment(@PathVariable String paymentId) {
        log.info("GET /api/payments/{}", paymentId);
        PaymentDTO payment = paymentService.getPayment(paymentId);
        return ResponseEntity.ok(payment);
    }

    @RequestMapping(value = "/callback", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<PaymentDTO> handleVNPayCallback(@RequestParam Map<String, String> params) {
        log.info("/api/payment/callback - Processing VNPay callback");
        PaymentDTO payment = paymentService.verifyPayment(params);
        return ResponseEntity.ok(payment);
    }

    public static class CreatePaymentRequest {
        private String orderId;
        private String paymentMethod;

        public String getOrderId() {
            return orderId;
        }

        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }
}
