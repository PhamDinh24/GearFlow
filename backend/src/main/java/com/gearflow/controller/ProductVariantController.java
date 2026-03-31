package com.gearflow.controller;

import com.gearflow.dto.ProductVariantDTO;
import com.gearflow.service.ProductVariantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/variants")
@Slf4j
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

    @GetMapping
    public ResponseEntity<List<ProductVariantDTO>> getProductVariants(@PathVariable String productId) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(productId));
    }

    @GetMapping("/{variantId}")
    public ResponseEntity<ProductVariantDTO> getVariant(
        @PathVariable String productId,
        @PathVariable String variantId) {
        return ResponseEntity.ok(productVariantService.getVariantById(variantId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariantDTO> createVariant(
        @PathVariable String productId,
        @RequestBody ProductVariantDTO variantDTO) {
        return ResponseEntity.ok(productVariantService.createVariant(productId, variantDTO));
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariantDTO> updateVariant(
        @PathVariable String productId,
        @PathVariable String variantId,
        @RequestBody ProductVariantDTO variantDTO) {
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, variantDTO));
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVariant(
        @PathVariable String productId,
        @PathVariable String variantId) {
        productVariantService.deleteVariant(variantId);
        return ResponseEntity.noContent().build();
    }
}
