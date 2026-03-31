package com.gearflow.controller;

import com.gearflow.dto.ProductDTO;
import com.gearflow.service.BulkOperationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/bulk-operations")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class BulkOperationController {
    private final BulkOperationService bulkOperationService;

    @PostMapping("/update-price")
    public ResponseEntity<Void> bulkUpdatePrice(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/update-price");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        BigDecimal newPrice = new BigDecimal(request.get("newPrice").toString());
        
        bulkOperationService.bulkUpdateProductPrice(productIds, newPrice);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-status")
    public ResponseEntity<Void> bulkUpdateStatus(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/update-status");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        Boolean isActive = (Boolean) request.get("isActive");
        
        bulkOperationService.bulkUpdateProductStatus(productIds, isActive);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-category")
    public ResponseEntity<Void> bulkUpdateCategory(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/update-category");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        String categoryId = (String) request.get("categoryId");
        
        bulkOperationService.bulkUpdateProductCategory(productIds, categoryId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-brand")
    public ResponseEntity<Void> bulkUpdateBrand(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/update-brand");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        String brandId = (String) request.get("brandId");
        
        bulkOperationService.bulkUpdateProductBrand(productIds, brandId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> bulkDeleteProducts(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/delete");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        
        bulkOperationService.bulkDeleteProducts(productIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/apply-discount")
    public ResponseEntity<Void> bulkApplyDiscount(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/apply-discount");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        BigDecimal discountPercentage = new BigDecimal(request.get("discountPercentage").toString());
        
        bulkOperationService.bulkApplyDiscount(productIds, discountPercentage);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/status")
    public ResponseEntity<List<ProductDTO>> getBulkOperationStatus(
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/bulk-operations/status");
        
        @SuppressWarnings("unchecked")
        List<String> productIds = (List<String>) request.get("productIds");
        
        return ResponseEntity.ok(bulkOperationService.getBulkOperationStatus(productIds));
    }
}
