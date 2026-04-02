package com.gearflow.service;

import com.gearflow.dto.WishlistDTO;
import com.gearflow.entity.Wishlist;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductService productService;

    private String getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof com.gearflow.security.UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }

        // Fallback to username for compatibility
        String name = authentication.getName();
        if (name != null && !name.isBlank()) {
            return name;
        }

        throw new BusinessException("Cannot determine user ID");
    }

    public List<WishlistDTO> getUserWishlist() {
        String userId = getCurrentUserId();
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistDTO addToWishlist(String productId) {
        String userId = getCurrentUserId();
        log.info("Adding product {} to wishlist for user {}", productId, userId);
        
        // Check if already in wishlist
        if (wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            log.warn("Product {} already in wishlist for user {}", productId, userId);
            throw new BusinessException("Product already in wishlist");
        }

        var product = productService.getProductById(productId); // throws ResourceNotFoundException

        Wishlist wishlist = Wishlist.builder()
                .id(java.util.UUID.randomUUID().toString())
                .userId(userId)
                .productId(productId)
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);
        log.info("Successfully added product {} to wishlist for user {}", productId, userId);

        return WishlistDTO.builder()
                .id(saved.getId())
                .userId(saved.getUserId())
                .productId(saved.getProductId())
                .productName(product.getName())
                .price(product.getBasePrice().doubleValue())
                .addedAt(saved.getCreatedAt())
                .product(product)
                .build();
    }

    @Transactional
    public void removeFromWishlist(String productId) {
        String userId = getCurrentUserId();
        log.info("Removing product {} from wishlist for user {}", productId, userId);
        
        if (!wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            log.warn("Product {} not found in wishlist for user {}", productId, userId);
            throw new ResourceNotFoundException("Product not in wishlist");
        }
        
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Successfully removed product {} from wishlist for user {}", productId, userId);
    }

    public boolean isInWishlist(String productId) {
        String userId = getCurrentUserId();
        return wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }

    private WishlistDTO convertToDTO(Wishlist wishlist) {
        var product = productService.getProductById(wishlist.getProductId());
        return WishlistDTO.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUserId())
                .productId(wishlist.getProductId())
                .productName(product.getName())
                .price(product.getBasePrice().doubleValue())
                .addedAt(wishlist.getCreatedAt())
                .product(product)
                .build();
    }
}
