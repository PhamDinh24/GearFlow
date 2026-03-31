package com.gearflow.service;

import com.gearflow.dto.ReviewDTO;
import com.gearflow.entity.Review;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.ReviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Transactional
    @CacheEvict(value = "reviews", key = "#productId", allEntries = true)
    public ReviewDTO createReview(String userId, String productId, Integer rating, String comment) {
        log.info("Creating review - User: {}, Product: {}, Rating: {}", userId, productId, rating);
        
        if (rating < 1 || rating > 5) {
            throw new BusinessException("Rating must be between 1 and 5");
        }

        // Check for duplicate review
        if (reviewRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new BusinessException("User already reviewed this product");
        }

        Review review = Review.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .productId(productId)
                .rating(rating)
                .comment(comment)
                .build();

        review = reviewRepository.save(review);
        log.info("Review created with ID: {}", review.getId());
        return toDTO(review);
    }

    @Transactional
    @CacheEvict(value = "reviews", allEntries = true)
    public ReviewDTO updateReview(String reviewId, Integer rating, String comment) {
        log.info("Updating review: {}", reviewId);
        
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new BusinessException("Rating must be between 1 and 5");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (rating != null) {
            review.setRating(rating);
        }
        if (comment != null && !comment.isEmpty()) {
            review.setComment(comment);
        }

        review = reviewRepository.save(review);
        log.info("Review updated: {}", reviewId);
        return toDTO(review);
    }

    @Transactional
    @CacheEvict(value = "reviews", allEntries = true)
    public void deleteReview(String reviewId) {
        log.info("Deleting review: {}", reviewId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        reviewRepository.delete(review);
        log.info("Review deleted: {}", reviewId);
    }

    @Cacheable(value = "reviews", key = "#productId")
    public List<ReviewDTO> getProductReviews(String productId) {
        log.info("Fetching reviews for product: {}", productId);
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "reviews", key = "'rating_' + #productId")
    public Double getAverageRating(String productId) {
        log.info("Fetching average rating for product: {}", productId);
        Double average = reviewRepository.getAverageRatingByProductId(productId);
        return average != null ? Math.round(average * 10.0) / 10.0 : 0.0;
    }

    @Transactional(readOnly = true)
    public ReviewDTO getReview(String reviewId) {
        log.info("Fetching review: {}", reviewId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return toDTO(review);
    }

    private ReviewDTO toDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .productId(review.getProductId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
