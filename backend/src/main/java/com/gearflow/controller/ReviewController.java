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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewDTO> createReview(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody Map<String, Object> request) {
        log.info("POST /reviews - User: {}", user.getId());
        String productId = (String) request.get("productId");
        Integer rating = ((Number) request.get("rating")).intValue();
        String comment = (String) request.get("comment");
        
        ReviewDTO review = reviewService.createReview(user.getId(), productId, rating, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable String reviewId,
            @RequestBody Map<String, Object> request) {
        log.info("PUT /reviews/{}", reviewId);
        Integer rating = request.get("rating") != null ? ((Number) request.get("rating")).intValue() : null;
        String comment = (String) request.get("comment");
        
        ReviewDTO review = reviewService.updateReview(reviewId, rating, comment);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteReview(@PathVariable String reviewId) {
        log.info("DELETE /reviews/{}", reviewId);
        reviewService.deleteReview(reviewId);
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
}
