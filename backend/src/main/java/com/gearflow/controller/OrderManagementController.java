package com.gearflow.controller;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.service.OrderManagementService;
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
        Order.OrderStatus status = Order.OrderStatus.valueOf(request.getStatus());
        return ResponseEntity.ok(orderManagementService.updateOrderStatus(orderId, status));
    }

    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
