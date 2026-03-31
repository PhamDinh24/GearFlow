package com.gearflow.controller;

import com.gearflow.dto.CartDTO;
import com.gearflow.dto.CartItemDTO;
import com.gearflow.security.UserPrincipal;
import com.gearflow.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            log.warn("GET /api/cart - Unauthorized: user is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("GET /api/cart for user: {}", user.getId());
        CartDTO cart = cartService.getCart(user.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CartItemDTO itemDTO) {
        if (user == null) {
            log.warn("POST /api/cart/items - Unauthorized: user is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("POST /api/cart/items - User: {}, Variant: {}", user.getId(), itemDTO.getVariantId());
        CartDTO cart = cartService.addItem(user.getId(), itemDTO.getVariantId(), itemDTO.getQuantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PutMapping("/items/{variantId}")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String variantId,
            @RequestBody CartItemDTO itemDTO) {
        if (user == null) {
            log.warn("PUT /api/cart/items/{} - Unauthorized: user is null", variantId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("PUT /api/cart/items/{} - User: {}", variantId, user.getId());
        CartDTO cart = cartService.updateItemQuantity(user.getId(), variantId, itemDTO.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<CartDTO> removeItem(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable String variantId) {
        if (user == null) {
            log.warn("DELETE /api/cart/items/{} - Unauthorized: user is null", variantId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("DELETE /api/cart/items/{} - User: {}", variantId, user.getId());
        CartDTO cart = cartService.removeItem(user.getId(), variantId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            log.warn("DELETE /api/cart - Unauthorized: user is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("DELETE /api/cart - User: {}", user.getId());
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
