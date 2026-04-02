package com.gearflow.controller;

import com.gearflow.dto.ProductDTO;
import com.gearflow.service.ProductRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationController {
    
    private final ProductRecommendationService recommendationService;

    @GetMapping("/{productId}/recommendations")
    public ResponseEntity<List<ProductDTO>> getRecommendations(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        log.info("GET /api/products/{}/recommendations?limit={}", productId, limit);
        return ResponseEntity.ok(recommendationService.getRecommendedProducts(productId, limit));
    }

    @GetMapping("/{productId}/same-brand")
    public ResponseEntity<List<ProductDTO>> getSameBrandProducts(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        log.info("GET /api/products/{}/same-brand?limit={}", productId, limit);
        return ResponseEntity.ok(recommendationService.getSameBrandProducts(productId, limit));
    }

    @GetMapping("/{productId}/same-category")
    public ResponseEntity<List<ProductDTO>> getSameCategoryProducts(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        log.info("GET /api/products/{}/same-category?limit={}", productId, limit);
        return ResponseEntity.ok(recommendationService.getSameCategoryProducts(productId, limit));
    }
}
