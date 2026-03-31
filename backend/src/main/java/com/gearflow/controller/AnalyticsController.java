package com.gearflow.controller;

import com.gearflow.service.AnalyticsService;
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
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProductAnalytics() {
        log.info("GET /api/admin/analytics/products");
        return ResponseEntity.ok(analyticsService.getProductAnalytics());
    }

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomerAnalytics() {
        log.info("GET /api/admin/analytics/customers");
        return ResponseEntity.ok(analyticsService.getCustomerAnalytics());
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/admin/analytics/sales - From: {} To: {}", startDate, endDate);
        return ResponseEntity.ok(analyticsService.getSalesAnalytics(startDate, endDate));
    }

    @GetMapping("/reviews")
    public ResponseEntity<Map<String, Object>> getReviewAnalytics() {
        log.info("GET /api/admin/analytics/reviews");
        return ResponseEntity.ok(analyticsService.getReviewAnalytics());
    }

    @GetMapping("/order-status-distribution")
    public ResponseEntity<Map<String, Object>> getOrderStatusDistribution() {
        log.info("GET /api/admin/analytics/order-status-distribution");
        return ResponseEntity.ok(analyticsService.getOrderStatusDistribution());
    }

    @GetMapping("/top-selling-products")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/admin/analytics/top-selling-products - Limit: {}", limit);
        return ResponseEntity.ok(analyticsService.getTopSellingProducts(limit));
    }

    @GetMapping("/top-rated-products")
    public ResponseEntity<List<Map<String, Object>>> getTopRatedProducts(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/admin/analytics/top-rated-products - Limit: {}", limit);
        return ResponseEntity.ok(analyticsService.getTopRatedProducts(limit));
    }
}
