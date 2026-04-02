package com.gearflow.controller;

import com.gearflow.dto.ProductVariantDTO;
import com.gearflow.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/variants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminVariantController {
    private final ProductVariantService productVariantService;

    @PutMapping("/{variantId}")
    public ResponseEntity<ProductVariantDTO> updateVariant(
            @PathVariable String variantId,
            @RequestBody ProductVariantDTO variantDTO) {
        log.info("Admin updating variant: {}", variantId);
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, variantDTO));
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable String variantId) {
        log.info("Admin deleting variant: {}", variantId);
        productVariantService.deleteVariant(variantId);
        return ResponseEntity.noContent().build();
    }
}
