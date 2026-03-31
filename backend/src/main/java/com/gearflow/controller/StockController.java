package com.gearflow.controller;

import com.gearflow.dto.StockDTO;
import com.gearflow.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/stock")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class StockController {
    private final StockService stockService;

    @GetMapping
    public ResponseEntity<Page<StockDTO>> getAllStock(Pageable pageable) {
        log.info("GET /api/admin/stock");
        return ResponseEntity.ok(stockService.getAllStock(pageable));
    }

    @GetMapping("/{variantId}")
    public ResponseEntity<StockDTO> getStockByVariantId(@PathVariable String variantId) {
        log.info("GET /api/admin/stock/{}", variantId);
        return ResponseEntity.ok(stockService.getStockByVariantId(variantId));
    }

    @PutMapping("/{variantId}")
    public ResponseEntity<StockDTO> updateStock(@PathVariable String variantId, @RequestParam Integer quantity) {
        log.info("PUT /api/admin/stock/{} - Quantity: {}", variantId, quantity);
        return ResponseEntity.ok(stockService.updateStock(variantId, quantity));
    }

    @PostMapping("/{variantId}/increment")
    public ResponseEntity<StockDTO> incrementStock(@PathVariable String variantId, @RequestParam Integer amount) {
        log.info("POST /api/admin/stock/{}/increment - Amount: {}", variantId, amount);
        return ResponseEntity.ok(stockService.incrementStock(variantId, amount));
    }

    @PostMapping("/{variantId}/decrement")
    public ResponseEntity<StockDTO> decrementStock(@PathVariable String variantId, @RequestParam Integer amount) {
        log.info("POST /api/admin/stock/{}/decrement - Amount: {}", variantId, amount);
        return ResponseEntity.ok(stockService.decrementStock(variantId, amount));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<StockDTO>> getLowStockItems(@RequestParam(defaultValue = "10") Integer threshold) {
        log.info("GET /api/admin/stock/low-stock - Threshold: {}", threshold);
        return ResponseEntity.ok(stockService.getLowStockItems(threshold));
    }

    @PostMapping("/{variantId}/reserve")
    public ResponseEntity<Void> reserveStock(@PathVariable String variantId, @RequestParam Integer amount) {
        log.info("POST /api/admin/stock/{}/reserve - Amount: {}", variantId, amount);
        stockService.reserveStock(variantId, amount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{variantId}/release")
    public ResponseEntity<Void> releaseReservedStock(@PathVariable String variantId, @RequestParam Integer amount) {
        log.info("POST /api/admin/stock/{}/release - Amount: {}", variantId, amount);
        stockService.releaseReservedStock(variantId, amount);
        return ResponseEntity.ok().build();
    }
}
