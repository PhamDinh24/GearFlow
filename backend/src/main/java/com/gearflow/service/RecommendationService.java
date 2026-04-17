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

    // ---- Product-based Recommendation methods (merged from ProductRecommendationService) ----

    public List<ProductDTO> getRecommendedProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId).orElse(null);
        if (currentProduct == null) {
            return getTrendingRecommendations(limit);
        }

        List<Product> recommendations = new ArrayList<>();

        List<Product> sameBrand = productRepository.findByBrandIdAndIdNot(
                currentProduct.getBrandId(), productId, org.springframework.data.domain.PageRequest.of(0, limit));
        recommendations.addAll(sameBrand);

        if (recommendations.size() < limit) {
            int remaining = limit - recommendations.size();
            List<Product> sameCategory = productRepository.findByCategoryIdAndIdNotAndBrandIdNot(
                    currentProduct.getCategoryId(), productId, currentProduct.getBrandId(),
                    org.springframework.data.domain.PageRequest.of(0, remaining));
            recommendations.addAll(sameCategory);
        }

        if (recommendations.size() < limit) {
            int remaining = limit - recommendations.size();
            List<String> excludeIds = recommendations.stream().map(Product::getId).collect(Collectors.toList());
            excludeIds.add(productId);
            List<Product> randomProducts = productRepository.findRandomProductsExcluding(
                    excludeIds, org.springframework.data.domain.PageRequest.of(0, remaining));
            recommendations.addAll(randomProducts);
        }

        return recommendations.stream().limit(limit).map(productService::convertToDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getSameBrandProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId).orElse(null);
        if (currentProduct == null) return List.of();
        return productRepository.findByBrandIdAndIdNot(
                        currentProduct.getBrandId(), productId, org.springframework.data.domain.PageRequest.of(0, limit))
                .stream().map(productService::convertToDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getSameCategoryProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId).orElse(null);
        if (currentProduct == null) return List.of();
        return productRepository.findByCategoryIdAndIdNot(
                        currentProduct.getCategoryId(), productId, org.springframework.data.domain.PageRequest.of(0, limit))
                .stream().map(productService::convertToDTO).collect(Collectors.toList());
    }

    // ---- Customer-based Recommendation methods (merged from CustomerProductRecommendationService) ----

    @org.springframework.cache.annotation.Cacheable(value = "customer_recommendations", key = "#customerId + '-' + #limit")
    public List<ProductDTO> getRecommendationsForCustomer(String customerId, int limit) {
        log.info("Getting recommendations for customer: {}", customerId);
        try {
            List<Order> customerOrders = orderRepository.findAllByUserId(customerId);
            if (customerOrders.isEmpty()) return getRandomProducts(limit);

            Set<String> purchasedCategories = new HashSet<>();
            Set<String> purchasedBrands = new HashSet<>();
            Set<String> purchasedProductIds = new HashSet<>();

            for (Order order : customerOrders) {
                if (order.getItems() != null) {
                    for (com.gearflow.entity.OrderItem item : order.getItems()) {
                        if (item.getProductId() != null) {
                            purchasedProductIds.add(item.getProductId());
                            productRepository.findById(item.getProductId()).ifPresent(p -> {
                                purchasedCategories.add(p.getCategoryId());
                                purchasedBrands.add(p.getBrandId());
                            });
                        }
                    }
                }
            }

            Map<String, ProductDTO> result = new LinkedHashMap<>();
            for (String categoryId : purchasedCategories) {
                productRepository.findByCategoryIdAndIdNot(categoryId, "dummy-id",
                        org.springframework.data.domain.PageRequest.of(0, limit * 2)).forEach(p -> {
                    if (!purchasedProductIds.contains(p.getId()) && result.size() < limit)
                        result.put(p.getId(), productService.convertToDTO(p));
                });
            }
            if (result.size() < limit) {
                for (String brandId : purchasedBrands) {
                    productRepository.findByBrandIdAndIdNot(brandId, "dummy-id",
                            org.springframework.data.domain.PageRequest.of(0, limit * 2)).forEach(p -> {
                        if (!purchasedProductIds.contains(p.getId()) && !result.containsKey(p.getId()) && result.size() < limit)
                            result.put(p.getId(), productService.convertToDTO(p));
                    });
                }
            }
            if (result.size() < limit) getRandomProducts(limit - result.size()).forEach(p -> result.putIfAbsent(p.getId(), p));

            return result.values().stream().limit(limit).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error generating recommendations for customer: {}", customerId, e);
            return getRandomProducts(limit);
        }
    }

    @org.springframework.cache.annotation.Cacheable(value = "popular_with_category", key = "#categoryId + '-' + #limit")
    public List<ProductDTO> getPopularProductsInCategory(String categoryId, int limit) {
        log.info("Getting popular products for category: {}", categoryId);
        try {
            return productRepository.findByCategoryId(categoryId).stream()
                    .limit(limit).map(productService::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching popular products: {}", categoryId, e);
            return new ArrayList<>();
        }
    }

    @org.springframework.cache.annotation.Cacheable(value = "random_products", key = "'all-' + #limit")
    public List<ProductDTO> getRandomProducts(int limit) {
        log.info("Getting {} random products", limit);
        try {
            return productRepository.findRandomProducts(org.springframework.data.domain.PageRequest.of(0, limit))
                    .stream().map(productService::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching random products", e);
            return new ArrayList<>();
        }
    }

    public List<ProductDTO> getCrossSellRecommendations(String productId, int limit) {
        log.info("Getting cross-sell recommendations for product: {}", productId);
        try {
            return productRepository.findById(productId).map(product -> {
                List<Product> crossSell = productRepository.findByBrandIdAndIdNot(
                        product.getBrandId(), productId, org.springframework.data.domain.PageRequest.of(0, limit * 2));
                Collections.shuffle(crossSell);
                return crossSell.stream().limit(limit).map(productService::convertToDTO).collect(Collectors.toList());
            }).orElse(getRandomProducts(limit));
        } catch (Exception e) {
            log.error("Error fetching cross-sell recommendations: {}", productId, e);
            return getRandomProducts(limit);
        }
    }
}
