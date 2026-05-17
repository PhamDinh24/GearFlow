package com.gearflow.service;

import com.gearflow.entity.Order;
import com.gearflow.exception.BusinessException;
import com.gearflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public void sendOrderConfirmationEmail(String orderId) {
        log.info("Sending order confirmation email for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found with id: " + orderId));

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("orderId", order.getId());
        emailData.put("userId", order.getUserId());
        emailData.put("totalAmount", order.getTotalAmount());
        emailData.put("shippingAddress", "N/A");
        emailData.put("createdAt", order.getCreatedAt());

        sendEmail(order.getUserId(), "Order Confirmation", emailData);
        log.info("Order confirmation email sent for order: {}", orderId);
    }

    @Transactional(readOnly = true)
    public void sendShippingNotificationEmail(String orderId, String trackingNumber) {
        log.info("Sending shipping notification email for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found with id: " + orderId));

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("orderId", order.getId());
        emailData.put("userId", order.getUserId());
        emailData.put("trackingNumber", trackingNumber);
        emailData.put("shippingAddress", "N/A");

        sendEmail(order.getUserId(), "Shipping Notification", emailData);
        log.info("Shipping notification email sent for order: {}", orderId);
    }

    @Transactional(readOnly = true)
    public void sendDeliveryNotificationEmail(String orderId) {
        log.info("Sending delivery notification email for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found with id: " + orderId));

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("orderId", order.getId());
        emailData.put("userId", order.getUserId());
        emailData.put("deliveryDate", order.getUpdatedAt());

        sendEmail(order.getUserId(), "Delivery Confirmation", emailData);
        log.info("Delivery notification email sent for order: {}", orderId);
    }

    @Transactional(readOnly = true)
    public void sendCancellationNotificationEmail(String orderId) {
        log.info("Sending cancellation notification email for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found with id: " + orderId));

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("orderId", order.getId());
        emailData.put("userId", order.getUserId());
        emailData.put("totalAmount", order.getTotalAmount());

        sendEmail(order.getUserId(), "Order Cancellation", emailData);
        log.info("Cancellation notification email sent for order: {}", orderId);
    }

    public void sendPasswordResetEmail(String email, String resetLink) {
        log.info("Sending password reset email to: {}", email);
        
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("email", email);
        emailData.put("resetLink", resetLink);
        emailData.put("expiryHours", 24);

        // In a real app, you would use a real email address here
        // For now, we use the email as the userId placeholder for the sendEmail method
        sendEmail(email, "Password Reset Request", emailData);
        
        // Output for development convenience
        log.info("================================================");
        log.info("PASSWORD RESET EMAIL SENT TO: {}", email);
        log.info("RESET LINK: {}", resetLink);
        log.info("================================================");
    }

    private void sendEmail(String userId, String subject, Map<String, Object> emailData) {
        log.info("Sending email to user: {} with subject: {}", userId, subject);
        // This is a placeholder implementation
        // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
        log.debug("Email data: {}", emailData);
    }
}
