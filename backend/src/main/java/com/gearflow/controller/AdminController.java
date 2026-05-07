package com.gearflow.controller;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.service.AdminService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
            @RequestParam(defaultValue = "5") int limit) {
        log.info("GET /api/admin/dashboard/top-products - Limit: {}", limit);
        List<Map<String, Object>> topProducts = adminService.getTopProducts(limit);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/dashboard/top-brands")
    public ResponseEntity<List<Map<String, Object>>> getTopBrands(
            @RequestParam(defaultValue = "3") int limit) {
        log.info("GET /api/admin/dashboard/top-brands - Limit: {}", limit);
        List<Map<String, Object>> topBrands = adminService.getTopBrands(limit);
        return ResponseEntity.ok(topBrands);
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
        List<OrderDTO> orders = adminService.getOrdersByStatusDetailed(status);
        return ResponseEntity.ok(orders);
    }

    // Analytics Endpoints
    @GetMapping("/analytics/products")
    public ResponseEntity<Map<String, Object>> getProductAnalytics() {
        return ResponseEntity.ok(adminService.getProductAnalytics());
    }

    @GetMapping("/analytics/reviews")
    public ResponseEntity<Map<String, Object>> getReviewAnalytics() {
        return ResponseEntity.ok(adminService.getReviewAnalytics());
    }

    @GetMapping("/analytics/order-status-distribution")
    public ResponseEntity<Map<String, Object>> getOrderStatusDistribution() {
        return ResponseEntity.ok(adminService.getOrderStatusDistribution());
    }

    @GetMapping("/analytics/top-rated-products")
    public ResponseEntity<List<Map<String, Object>>> getTopRatedProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getTopRatedProducts(limit));
    }

    // Export Endpoints
    @GetMapping("/export/orders")
    public ResponseEntity<byte[]> exportOrders() {
        byte[] data = adminService.exportOrdersAsCSV();
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=orders.csv")
                .body(data);
    }

    @GetMapping("/export/products")
    public ResponseEntity<byte[]> exportProducts() {
        byte[] data = adminService.exportProductsAsCSV();
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=products.csv")
                .body(data);
    }

    // Bulk Operations Endpoints
    @DeleteMapping("/bulk/products/delete")
    public ResponseEntity<Void> bulkDeleteProducts(@RequestBody List<String> productIds) {
        adminService.bulkDeleteProducts(productIds);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/bulk/products/update-category")
    public ResponseEntity<Void> bulkUpdateCategory(
            @RequestParam String categoryId,
            @RequestBody List<String> productIds) {
        adminService.bulkUpdateProductCategory(productIds, categoryId);
        return ResponseEntity.ok().build();
    }

    // Order Management
    @GetMapping("/payments")
    public ResponseEntity<List<com.gearflow.dto.PaymentDTO>> getAllPayments() {
        log.info("GET /api/admin/payments");
        return ResponseEntity.ok(adminService.getAllPayments());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        log.info("PUT /api/admin/orders/{}/status - Status: {}", id, request.getStatus());
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
            OrderDTO order = adminService.updateOrderStatus(id, status.toString());
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", request.getStatus());
            throw new com.gearflow.exception.BusinessException("Invalid order status: " + request.getStatus());
        }
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<OrderDTO> adminCancelOrder(@PathVariable String id) {
        log.info("POST /api/admin/orders/{}/cancel", id);
        return ResponseEntity.ok(adminService.adminCancelOrder(id));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusUpdateRequest {
        private String status;
    }
}
