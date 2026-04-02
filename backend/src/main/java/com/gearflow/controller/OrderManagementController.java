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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusUpdateRequest {
        private String status;
    }
}
