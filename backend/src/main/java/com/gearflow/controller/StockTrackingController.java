package com.gearflow.controller;

import com.gearflow.dto.StockDTO;
import com.gearflow.service.StockTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/stock-tracking")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class StockTrackingController {
    private final StockTrackingService stockTrackingService;

    @GetMapping("/history")
    public ResponseEntity<Page<StockDTO>> getStockHistory(Pageable pageable) {
        log.info("GET /api/admin/stock-tracking/history");
        return ResponseEntity.ok(stockTrackingService.getStockHistory(pageable));
    }

    @GetMapping("/snapshot/{variantId}")
    public ResponseEntity<StockDTO> getStockSnapshot(@PathVariable String variantId) {
        log.info("GET /api/admin/stock-tracking/snapshot/{}", variantId);
        return ResponseEntity.ok(stockTrackingService.getStockSnapshot(variantId));
    }

    @GetMapping("/movements/{variantId}")
    public ResponseEntity<List<StockDTO>> getStockMovements(@PathVariable String variantId) {
        log.info("GET /api/admin/stock-tracking/movements/{}", variantId);
        return ResponseEntity.ok(stockTrackingService.getStockMovements(variantId));
    }

    @GetMapping("/recent-changes")
    public ResponseEntity<List<StockDTO>> getRecentStockChanges(
            @RequestParam(defaultValue = "7") int days) {
        log.info("GET /api/admin/stock-tracking/recent-changes - Days: {}", days);
        return ResponseEntity.ok(stockTrackingService.getRecentStockChanges(days));
    }

    @GetMapping("/by-quantity-range")
    public ResponseEntity<List<StockDTO>> getStockByQuantityRange(
            @RequestParam Integer minQuantity,
            @RequestParam Integer maxQuantity) {
        log.info("GET /api/admin/stock-tracking/by-quantity-range - Min: {} Max: {}", minQuantity, maxQuantity);
        return ResponseEntity.ok(stockTrackingService.getStockByQuantityRange(minQuantity, maxQuantity));
    }

    @GetMapping("/high-reserved")
    public ResponseEntity<List<StockDTO>> getHighReservedStock() {
        log.info("GET /api/admin/stock-tracking/high-reserved");
        return ResponseEntity.ok(stockTrackingService.getHighReservedStock());
    }
}
