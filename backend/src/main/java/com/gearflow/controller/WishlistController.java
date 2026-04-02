package com.gearflow.controller;

import com.gearflow.dto.WishlistDTO;
import com.gearflow.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Slf4j
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getWishlist() {
        log.info("GET /api/wishlist");
        return ResponseEntity.ok(wishlistService.getUserWishlist());
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistDTO> addToWishlist(@PathVariable String productId) {
        log.info("POST /api/wishlist/{}", productId);
        return ResponseEntity.ok(wishlistService.addToWishlist(productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable String productId) {
        log.info("DELETE /api/wishlist/{}", productId);
        wishlistService.removeFromWishlist(productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> isInWishlist(@PathVariable String productId) {
        log.info("GET /api/wishlist/check/{}", productId);
        return ResponseEntity.ok(wishlistService.isInWishlist(productId));
    }
}
