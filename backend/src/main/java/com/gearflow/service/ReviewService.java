package com.gearflow.service;

import com.gearflow.dto.ReviewDTO;
import com.gearflow.entity.Review;
import com.gearflow.entity.User;
import com.gearflow.entity.Order;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.ReviewRepository;
import com.gearflow.repository.UserRepository;
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

    @Autowired
    private com.gearflow.repository.OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository; // Thêm UserRepository

    @Transactional
    @CacheEvict(value = "reviews", allEntries = true)
    public ReviewDTO createReview(String userId, String productId, String orderItemId, Integer rating, String comment) {
        log.info("Creating review - User: {}, Product: {}, OrderItem: {}, Rating: {}", userId, productId, orderItemId, rating);
        
        if (rating < 1 || rating > 5) {
            throw new BusinessException("Rating must be between 1 and 5");
        }

        // Check if user has purchased and received the product
        if (!orderRepository.hasUserPurchasedProductAndReceived(userId, productId, Order.OrderStatus.DELIVERED)) {
            throw new BusinessException("Bạn chỉ có thể đánh giá sau khi đã nhận được hàng");
        }

        // Check for duplicate review for this specific order item
        if (orderItemId != null && reviewRepository.findByUserIdAndOrderItemId(userId, orderItemId).isPresent()) {
            throw new BusinessException("Bạn đã đánh giá sản phẩm này cho lần mua hàng này rồi");
        } else if (orderItemId == null && reviewRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
             // Fallback for old reviews without orderItemId
             throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Review review = Review.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .productId(productId)
                .orderItemId(orderItemId)
                .rating(rating)
                .comment(comment)
                .build();

        review = reviewRepository.save(review);
        log.info("Review created with ID: {}", review.getId());
        return toDTO(review);
    }

    @Transactional
    @CacheEvict(value = "reviews", allEntries = true)
    public ReviewDTO updateReview(String reviewId, String userId, Integer rating, String comment) {
        log.info("Updating review: {} by user: {}", reviewId, userId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUserId().equals(userId)) {
            throw new BusinessException("You can only update your own reviews");
        }

        if (rating != null && (rating < 1 || rating > 5)) {
            throw new BusinessException("Rating must be between 1 and 5");
        }

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
    public void deleteReview(String reviewId, String userId) {
        log.info("Deleting review: {} by user: {}", reviewId, userId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw new BusinessException("You can only delete your own reviews");
        }
        
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

    public boolean canUserReview(String userId, String productId) {
        return orderRepository.hasUserPurchasedProductAndReceived(userId, productId, Order.OrderStatus.DELIVERED) &&
               reviewRepository.findByUserIdAndProductId(userId, productId).isEmpty();
    }

    private ReviewDTO toDTO(Review review) {
        // Lấy thông tin user để có userName
        String userName = "Người dùng"; // Giá trị mặc định
        try {
            User user = userRepository.findById(review.getUserId()).orElse(null);
            if (user != null) {
                userName = user.getUsername(); // Sử dụng username thay vì fullName
            }
        } catch (Exception e) {
            log.warn("Could not fetch user info for review {}: {}", review.getId(), e.getMessage());
        }

        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .productId(review.getProductId())
                .orderItemId(review.getOrderItemId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userName(userName) // Thêm userName
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
