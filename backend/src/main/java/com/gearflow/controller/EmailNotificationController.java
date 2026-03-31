package com.gearflow.controller;

import com.gearflow.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/email-notifications")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class EmailNotificationController {
    private final EmailNotificationService emailNotificationService;

    @PostMapping("/order-confirmation/{orderId}")
    public ResponseEntity<Void> sendOrderConfirmationEmail(@PathVariable String orderId) {
        log.info("POST /api/admin/email-notifications/order-confirmation/{}", orderId);
        emailNotificationService.sendOrderConfirmationEmail(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/shipping-notification/{orderId}")
    public ResponseEntity<Void> sendShippingNotificationEmail(
            @PathVariable String orderId,
            @RequestParam String trackingNumber) {
        log.info("POST /api/admin/email-notifications/shipping-notification/{}", orderId);
        emailNotificationService.sendShippingNotificationEmail(orderId, trackingNumber);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delivery-notification/{orderId}")
    public ResponseEntity<Void> sendDeliveryNotificationEmail(@PathVariable String orderId) {
        log.info("POST /api/admin/email-notifications/delivery-notification/{}", orderId);
        emailNotificationService.sendDeliveryNotificationEmail(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancellation-notification/{orderId}")
    public ResponseEntity<Void> sendCancellationNotificationEmail(@PathVariable String orderId) {
        log.info("POST /api/admin/email-notifications/cancellation-notification/{}", orderId);
        emailNotificationService.sendCancellationNotificationEmail(orderId);
        return ResponseEntity.ok().build();
    }
}
