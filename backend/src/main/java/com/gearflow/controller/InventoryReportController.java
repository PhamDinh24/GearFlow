package com.gearflow.controller;

import com.gearflow.service.InventoryReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/inventory-reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class InventoryReportController {
    private final InventoryReportService inventoryReportService;

    @GetMapping("/low-stock")
    public ResponseEntity<List<Map<String, Object>>> getLowStockReport(
            @RequestParam(defaultValue = "10") Integer threshold) {
        log.info("GET /api/admin/inventory-reports/low-stock - Threshold: {}", threshold);
        return ResponseEntity.ok(inventoryReportService.getLowStockReport(threshold));
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Map<String, Object>>> getOutOfStockReport() {
        log.info("GET /api/admin/inventory-reports/out-of-stock");
        return ResponseEntity.ok(inventoryReportService.getOutOfStockReport());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        log.info("GET /api/admin/inventory-reports/summary");
        return ResponseEntity.ok(inventoryReportService.getInventorySummary());
    }

    @GetMapping("/by-variant")
    public ResponseEntity<List<Map<String, Object>>> getInventoryByVariant() {
        log.info("GET /api/admin/inventory-reports/by-variant");
        return ResponseEntity.ok(inventoryReportService.getInventoryByVariant());
    }
}
