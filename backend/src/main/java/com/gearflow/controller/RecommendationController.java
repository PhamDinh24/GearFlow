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
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping("/view-based")
    public ResponseEntity<List<ProductDTO>> getViewBasedRecommendations(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/view-based - User: {}", user.getId());
        List<ProductDTO> recommendations = recommendationService.getViewBasedRecommendations(user.getId(), limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/purchase-based")
    public ResponseEntity<List<ProductDTO>> getPurchaseBasedRecommendations(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/purchase-based - User: {}", user.getId());
        List<ProductDTO> recommendations = recommendationService.getPurchaseBasedRecommendations(user.getId(), limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/accessories/{productId}")
    public ResponseEntity<List<ProductDTO>> getAccessoryRecommendations(
            @PathVariable String productId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/accessories/{}", productId);
        List<ProductDTO> recommendations = recommendationService.getAccessoryRecommendations(productId, limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ProductDTO>> getTrendingRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/recommendations/trending");
        List<ProductDTO> recommendations = recommendationService.getTrendingRecommendations(limit);
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/track/{productId}")
    public ResponseEntity<Void> trackProductView(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String productId) {
        String userId = user != null ? user.getId() : "00000000-0000-0000-0000-000000000000";
        log.info("POST /api/recommendations/track/{} - User: {}", productId, userId);
        recommendationService.trackProductView(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
