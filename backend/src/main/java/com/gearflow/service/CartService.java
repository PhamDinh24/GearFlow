package com.gearflow.service;

import com.gearflow.dto.CartDTO;
import com.gearflow.dto.CartItemDTO;
import com.gearflow.entity.Cart;
import com.gearflow.entity.CartItem;
import com.gearflow.entity.Product;
import com.gearflow.entity.ProductVariant;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.CartRepository;
import com.gearflow.repository.ProductRepository;
import com.gearflow.repository.ProductVariantRepository;
import com.gearflow.repository.StockRepository;
import com.gearflow.entity.Stock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    private final CartRepository cartRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public CartDTO getCart(String userId) {
        log.info("Fetching cart for user: {}", userId);
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyCart(userId));
        return toDTO(cart);
    }

    @Transactional
    public CartDTO addItem(String userId, String variantId, Integer quantity) {
        log.info("Adding item to cart - User: {}, Variant: {}, Quantity: {}", userId, variantId, quantity);
        
        if (quantity <= 0) {
            throw new BusinessException("Quantity must be greater than 0");
        }

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .id(UUID.randomUUID().toString())
                            .userId(userId)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Check if item already exists in cart
        boolean itemExists = false;
        for (CartItem item : cart.getItems()) {
            if (item.getVariantId().equals(variantId)) {
                item.setQuantity(item.getQuantity() + quantity);
                itemExists = true;
                break;
            }
        }

        if (!itemExists) {
            CartItem newItem = CartItem.builder()
                    .id(UUID.randomUUID().toString())
                    .cart(cart)
                    .variantId(variantId)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        log.info("Item added to cart successfully");
        return toDTO(cart);
    }

    @Transactional
    public CartDTO removeItem(String userId, String variantId) {
        log.info("Removing item from cart - User: {}, Variant: {}", userId, variantId);
        
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().removeIf(item -> item.getVariantId().equals(variantId));
        cart = cartRepository.save(cart);
        
        log.info("Item removed from cart successfully");
        return toDTO(cart);
    }

    @Transactional
    public CartDTO updateItemQuantity(String userId, String variantId, Integer quantity) {
        log.info("Updating item quantity - User: {}, Variant: {}, Quantity: {}", userId, variantId, quantity);
        
        if (quantity <= 0) {
            throw new BusinessException("Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getVariantId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        item.setQuantity(quantity);
        cart = cartRepository.save(cart);
        
        log.info("Item quantity updated successfully");
        return toDTO(cart);
    }

    @Transactional
    public void clearCart(String userId) {
        log.info("Clearing cart for user: {}", userId);
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
        log.info("Cart cleared successfully");
    }

    private Cart createEmptyCart(String userId) {
        return Cart.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .build();
    }

    private CartDTO toDTO(Cart cart) {
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalItems = 0;

        var items = cart.getItems().stream()
                .map(item -> {
                    ProductVariant variant = variantRepository.findById(item.getVariantId())
                            .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
                    Product product = productRepository.findById(variant.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                    BigDecimal price = product.getBasePrice().add(variant.getPriceModifier());
                    BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

                    // Build variant details string
                    StringBuilder variantDetails = new StringBuilder();
                    if (variant.getColor() != null && !variant.getColor().isEmpty()) {
                        variantDetails.append(variant.getColor());
                    }
                    if (variant.getSwitchType() != null && !variant.getSwitchType().isEmpty()) {
                        if (variantDetails.length() > 0) variantDetails.append(", ");
                        variantDetails.append(variant.getSwitchType());
                    }
                    if (variant.getKeycapSet() != null && !variant.getKeycapSet().isEmpty()) {
                        if (variantDetails.length() > 0) variantDetails.append(", ");
                        variantDetails.append(variant.getKeycapSet());
                    }
                    if (variant.getConnectionType() != null && !variant.getConnectionType().isEmpty()) {
                        if (variantDetails.length() > 0) variantDetails.append(", ");
                        variantDetails.append(variant.getConnectionType());
                    }

                    Integer stockQty = stockRepository.findById(item.getVariantId())
                            .map(Stock::getQuantity)
                            .orElse(0);

                    return CartItemDTO.builder()
                            .variantId(item.getVariantId())
                            .productId(product.getId())
                            .productName(product.getName())
                            .imageUrl(product.getImageUrl())
                            .variantDetails(variantDetails.length() > 0 ? variantDetails.toString() : null)
                            .quantity(item.getQuantity())
                            .price(price)
                            .subtotal(subtotal)
                            .stock(stockQty)
                            .build();
                })
                .collect(Collectors.toList());

        for (CartItemDTO item : items) {
            totalPrice = totalPrice.add(item.getSubtotal());
            totalItems += item.getQuantity();
        }

        return CartDTO.builder()
                .userId(cart.getUserId())
                .items(items)
                .totalPrice(totalPrice)
                .totalItems(totalItems)
                .build();
    }
}
