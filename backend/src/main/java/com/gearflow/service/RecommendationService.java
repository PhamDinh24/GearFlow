package com.gearflow.service;

import com.gearflow.dto.ProductDTO;
import com.gearflow.entity.Order;
import com.gearflow.entity.OrderItem;
import com.gearflow.entity.Product;
import com.gearflow.entity.ProductView;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.ProductRepository;
import com.gearflow.repository.ProductViewRepository;
import com.gearflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    private final ProductViewRepository productViewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Cacheable(value = "recommendations_view", key = "#userId + '-' + #limit", unless = "#result == null || #result.isEmpty()")
    public List<ProductDTO> getViewBasedRecommendations(String userId, int limit) {
        log.info("Getting view-based recommendations for user: {}, limit: {}", userId, limit);
        
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get user's viewed products
        List<ProductView> viewedProducts = productViewRepository.findByUserIdOrderByViewedAtDesc(userId);
        
        if (viewedProducts.isEmpty()) {
            return getTrendingRecommendations(limit);
        }

        // Get categories from viewed products
        Set<String> viewedCategories = viewedProducts.stream()
                .limit(10) // Only consider last 10 views
                .map(ProductView::getProductId)
                .map(productId -> productRepository.findById(productId).orElse(null))
                .filter(Objects::nonNull)
                .map(Product::getCategoryId)
                .collect(Collectors.toSet());

        if (viewedCategories.isEmpty()) {
            return getTrendingRecommendations(limit);
        }

        // Find products in same categories (excluding already viewed)
        Set<String> viewedProductIds = viewedProducts.stream()
                .map(ProductView::getProductId)
                .collect(Collectors.toSet());

        List<Product> recommendations = productRepository.findAll().stream()
                .filter(p -> viewedCategories.contains(p.getCategoryId()))
                .filter(p -> !viewedProductIds.contains(p.getId()))
                .limit(limit)
                .collect(Collectors.toList());

        return recommendations.stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "recommendations_purchase", key = "#userId + '-' + #limit", unless = "#result == null || #result.isEmpty()")
    public List<ProductDTO> getPurchaseBasedRecommendations(String userId, int limit) {
        log.info("Getting purchase-based recommendations for user: {}, limit: {}", userId, limit);
        
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get user's orders (without pagination for recommendations)
        List<Order> allOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED);
        List<Order> userOrders = allOrders.stream()
                .filter(order -> order.getUserId().equals(userId))
                .collect(Collectors.toList());
        
        Set<String> purchasedProductIds = userOrders.stream()
                .flatMap(order -> order.getItems() != null ? order.getItems().stream() : java.util.stream.Stream.empty())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        if (purchasedProductIds.isEmpty()) {
            return getTrendingRecommendations(limit);
        }

        // Get categories and brands from purchased products
        List<Product> purchasedProducts = productRepository.findAllById(purchasedProductIds);
        Set<String> purchasedCategories = purchasedProducts.stream()
                .map(Product::getCategoryId)
                .collect(Collectors.toSet());
        Set<String> purchasedBrands = purchasedProducts.stream()
                .map(Product::getBrandId)
                .collect(Collectors.toSet());

        // Find similar products (same category or brand, not purchased)
        List<Product> similarProducts = productRepository.findAll().stream()
                .filter(p -> !purchasedProductIds.contains(p.getId()))
                .filter(p -> purchasedCategories.contains(p.getCategoryId()) || 
                            purchasedBrands.contains(p.getBrandId()))
                .limit(limit)
                .collect(Collectors.toList());

        return similarProducts.stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "recommendations_accessory", key = "#productId + '-' + #limit", unless = "#result == null || #result.isEmpty()")
    public List<ProductDTO> getAccessoryRecommendations(String productId, int limit) {
        log.info("Getting accessory recommendations for product: {}, limit: {}", productId, limit);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Find products in same category or brand (excluding current product)
        List<Product> accessories = productRepository.findAll().stream()
                .filter(p -> !p.getId().equals(productId))
                .filter(p -> p.getCategoryId().equals(product.getCategoryId()) || 
                            p.getBrandId().equals(product.getBrandId()))
                .limit(limit)
                .collect(Collectors.toList());

        return accessories.stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "recommendations_trending", key = "#limit")
    public List<ProductDTO> getTrendingRecommendations(int limit) {
        log.info("Getting trending recommendations");
        
        List<Product> trendingProducts = productRepository.findAll().stream()
                .limit(limit)
                .collect(Collectors.toList());

        return trendingProducts.stream()
                .map(p -> productService.convertToDTO(p))
                .collect(Collectors.toList());
    }

    public void trackProductView(String userId, String productId) {
        log.info("Tracking product view - User: {}, Product: {}", userId, productId);
        
        try {
            ProductView view = ProductView.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .userId(userId)
                    .productId(productId)
                    .build();
            
            productViewRepository.save(view);
        } catch (Exception e) {
            log.error("Error tracking product view", e);
        }
    }
}
