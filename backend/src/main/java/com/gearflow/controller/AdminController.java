package com.gearflow.controller;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("GET /api/admin/dashboard/stats");
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting dashboard stats", e);
            // Return empty stats on error
            return ResponseEntity.ok(Map.of(
                "totalRevenue", 0,
                "totalOrders", 0,
                "totalUsers", 0
            ));
        }
    }

    @GetMapping("/dashboard/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/admin/dashboard/top-products - Limit: {}", limit);
        List<Map<String, Object>> topProducts = adminService.getTopProducts(limit);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/dashboard/sales-report")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/admin/dashboard/sales-report - From: {} To: {}", startDate, endDate);
        Map<String, Object> report = adminService.getSalesReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(
            @RequestParam(required = false) Order.OrderStatus status) {
        log.info("GET /api/admin/orders - Status: {}", status);
        List<OrderDTO> orders = adminService.getOrdersByStatus(status != null ? status : Order.OrderStatus.PENDING);
        return ResponseEntity.ok(orders);
    }

    // Order Management
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        log.info("PUT /api/admin/orders/{}/status - Status: {}", id, request.get("status"));
        String status = request.get("status");
        OrderDTO order = adminService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}
