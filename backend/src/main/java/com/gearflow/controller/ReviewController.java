package com.gearflow.controller;

import com.gearflow.dto.ReviewDTO;
import com.gearflow.security.UserPrincipal;
import com.gearflow.service.ReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@Slf4j
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDTO> createReview(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody Map<String, Object> request) {
        log.info("POST /reviews - User: {}", user.getId());
        String productId = (String) request.get("productId");
        String orderItemId = (String) request.get("orderItemId");
        Integer rating = ((Number) request.get("rating")).intValue();
        String comment = (String) request.get("comment");
        
        ReviewDTO review = reviewService.createReview(user.getId(), productId, orderItemId, rating, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable String reviewId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody Map<String, Object> request) {
        log.info("PUT /reviews/{} - User: {}", reviewId, user.getId());
        Integer rating = request.get("rating") != null ? ((Number) request.get("rating")).intValue() : null;
        String comment = (String) request.get("comment");
        
        ReviewDTO review = reviewService.updateReview(reviewId, user.getId(), rating, comment);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable String reviewId,
            @AuthenticationPrincipal UserPrincipal user) {
        log.info("DELETE /reviews/{} - User: {}", reviewId, user.getId());
        reviewService.deleteReview(reviewId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable String productId) {
        log.info("GET /reviews/product/{}", productId);
        List<ReviewDTO> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable String productId) {
        log.info("GET /reviews/product/{}/rating", productId);
        Double rating = reviewService.getAverageRating(productId);
        return ResponseEntity.ok(Map.of("averageRating", rating));
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> getReview(@PathVariable String reviewId) {
        log.info("GET /reviews/{}", reviewId);
        ReviewDTO review = reviewService.getReview(reviewId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/can-review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> canReview(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam String productId) {
        log.info("GET /reviews/can-review - User: {}, Product: {}", user.getId(), productId);
        boolean canReview = reviewService.canUserReview(user.getId(), productId);
        return ResponseEntity.ok(Map.of("canReview", canReview));
    }
}
