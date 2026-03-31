package com.gearflow.service;

import com.gearflow.dto.WishlistDTO;
import com.gearflow.entity.Wishlist;
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
        return SecurityContextHolder.getContext().getAuthentication().getName();
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
        
        // Check if already in wishlist
        if (wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new IllegalArgumentException("Product already in wishlist");
        }

        // Verify product exists
        productService.getProductById(productId);

        Wishlist wishlist = Wishlist.builder()
                .id(java.util.UUID.randomUUID().toString())
                .userId(userId)
                .productId(productId)
                .build();

        return convertToDTO(wishlistRepository.save(wishlist));
    }

    @Transactional
    public void removeFromWishlist(String productId) {
        String userId = getCurrentUserId();
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
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
                .build();
    }
}
