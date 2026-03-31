package com.gearflow.controller;

import com.gearflow.dto.PaymentDTO;
import com.gearflow.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@RequestParam String orderId) {
        log.info("POST /api/payments - Order: {}", orderId);
        PaymentDTO payment = paymentService.createPayment(orderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/{paymentId}/vnpay-url")
    public ResponseEntity<Map<String, String>> getVNPayUrl(@PathVariable String paymentId) throws UnsupportedEncodingException {
        log.info("GET /api/payments/{}/vnpay-url", paymentId);
        String paymentUrl = paymentService.generateVNPayRequest(paymentId);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentDTO> getPayment(@PathVariable String paymentId) {
        log.info("GET /api/payments/{}", paymentId);
        PaymentDTO payment = paymentService.getPayment(paymentId);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/callback")
    public ResponseEntity<PaymentDTO> handleVNPayCallback(@RequestParam Map<String, String> params) {
        log.info("POST /api/payments/callback - Processing VNPay callback");
        PaymentDTO payment = paymentService.verifyPayment(params);
        return ResponseEntity.ok(payment);
    }
}
