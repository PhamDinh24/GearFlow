package com.gearflow.controller;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.service.OrderManagementService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class OrderManagementController {
    private final OrderManagementService orderManagementService;

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        log.info("GET /api/admin/orders");
        return ResponseEntity.ok(orderManagementService.getAllOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable String orderId) {
        log.info("GET /api/admin/orders/{}", orderId);
        return ResponseEntity.ok(orderManagementService.getOrder(orderId));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable String orderId) {
        log.info("POST /api/admin/orders/{}/cancel", orderId);
        return ResponseEntity.ok(orderManagementService.cancelOrder(orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody StatusUpdateRequest request) {
        log.info("PUT /api/admin/orders/{}/status - Status: {}", orderId, request.getStatus());
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
            OrderDTO result = orderManagementService.updateOrderStatus(orderId, status);
            log.info("Order status updated successfully for id: {}", orderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", request.getStatus());
            throw new com.gearflow.exception.BusinessException("Invalid order status: " + request.getStatus());
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusUpdateRequest {
        private String status;
    }
}
