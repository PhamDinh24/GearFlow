package com.gearflow.controller;

import com.gearflow.dto.ProductDTO;
import com.gearflow.security.UserPrincipal;
import com.gearflow.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {
    private final RecommendationService recommendationService;

    // --- User-based recommendations ---

    @GetMapping("/recommendations/view-based")
    public ResponseEntity<List<ProductDTO>> getViewBasedRecommendations(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/view-based - User: {}", user.getId());
        return ResponseEntity.ok(recommendationService.getViewBasedRecommendations(user.getId(), limit));
    }

    @GetMapping("/recommendations/purchase-based")
    public ResponseEntity<List<ProductDTO>> getPurchaseBasedRecommendations(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/purchase-based - User: {}", user.getId());
        return ResponseEntity.ok(recommendationService.getPurchaseBasedRecommendations(user.getId(), limit));
    }

    @GetMapping("/recommendations/customer-related")
    public ResponseEntity<List<ProductDTO>> getCustomerRelatedRecommendations(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/customer-related - User: {}", user.getId());
        return ResponseEntity.ok(recommendationService.getRecommendationsForCustomer(user.getId(), limit));
    }

    @GetMapping("/recommendations/accessories/{productId}")
    public ResponseEntity<List<ProductDTO>> getAccessoryRecommendations(
            @PathVariable String productId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/accessories/{}", productId);
        return ResponseEntity.ok(recommendationService.getAccessoryRecommendations(productId, limit));
    }

    @GetMapping("/recommendations/trending")
    public ResponseEntity<List<ProductDTO>> getTrendingRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/trending");
        return ResponseEntity.ok(recommendationService.getTrendingRecommendations(limit));
    }

    @GetMapping("/recommendations/random")
    public ResponseEntity<List<ProductDTO>> getRandomRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/random - limit: {}", limit);
        return ResponseEntity.ok(recommendationService.getRandomProducts(limit));
    }

    @GetMapping("/recommendations/customer-popular/{categoryId}")
    public ResponseEntity<List<ProductDTO>> getCustomerPopularInCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/customer-popular/{}", categoryId);
        return ResponseEntity.ok(recommendationService.getPopularProductsInCategory(categoryId, limit));
    }

    @GetMapping("/recommendations/customer-crosssell/{productId}")
    public ResponseEntity<List<ProductDTO>> getCustomerCrossSellRecommendations(
            @PathVariable String productId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/customer-crosssell/{}", productId);
        return ResponseEntity.ok(recommendationService.getCrossSellRecommendations(productId, limit));
    }

    @PostMapping("/recommendations/track/{productId}")
    public ResponseEntity<Void> trackProductView(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String productId) {
        String userId = user != null ? user.getId() : "00000000-0000-0000-0000-000000000000";
        log.info("POST /api/recommendations/track/{} - User: {}", productId, userId);
        recommendationService.trackProductView(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // --- Product-specific recommendation routes ---

    @GetMapping("/products/{productId}/recommendations")
    public ResponseEntity<List<ProductDTO>> getRecommendations(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        log.info("GET /api/products/{}/recommendations?limit={}", productId, limit);
        return ResponseEntity.ok(recommendationService.getRecommendedProducts(productId, limit));
    }

    @GetMapping("/products/{productId}/same-brand")
    public ResponseEntity<List<ProductDTO>> getSameBrandProducts(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        log.info("GET /api/products/{}/same-brand?limit={}", productId, limit);
        return ResponseEntity.ok(recommendationService.getSameBrandProducts(productId, limit));
    }

    @GetMapping("/products/{productId}/same-category")
    public ResponseEntity<List<ProductDTO>> getSameCategoryProducts(
            @PathVariable String productId,
            @RequestParam(defaultValue = "6") int limit) {
        log.info("GET /api/products/{}/same-category?limit={}", productId, limit);
        return ResponseEntity.ok(recommendationService.getSameCategoryProducts(productId, limit));
    }
}
