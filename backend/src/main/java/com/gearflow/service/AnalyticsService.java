package com.gearflow.service;

import com.gearflow.entity.Order;
import com.gearflow.entity.Product;
import com.gearflow.entity.Review;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.ProductRepository;
import com.gearflow.repository.ReviewRepository;
import com.gearflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "product_analytics")
    public Map<String, Object> getProductAnalytics() {
        log.info("Fetching product analytics");
        
        List<Product> allProducts = productRepository.findAll();
        long totalProducts = allProducts.size();
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalProducts", totalProducts);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "customer_analytics")
    public Map<String, Object> getCustomerAnalytics() {
        log.info("Fetching customer analytics");
        
        long totalCustomers = userRepository.count();
        long newCustomersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt().isAfter(LocalDateTime.now().minusMonths(1)))
                .count();
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalCustomers", totalCustomers);
        analytics.put("newCustomersThisMonth", newCustomersThisMonth);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "sales_analytics")
    public Map<String, Object> getSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching sales analytics from {} to {}", startDate, endDate);
        
        List<Order> ordersInRange = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(startDate) && o.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        BigDecimal totalSales = ordersInRange.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = ordersInRange.size();
        long completedOrders = ordersInRange.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalSales", totalSales);
        analytics.put("totalOrders", totalOrders);
        analytics.put("completedOrders", completedOrders);
        analytics.put("averageOrderValue", totalOrders > 0 ? totalSales.divide(BigDecimal.valueOf(totalOrders)) : 0);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReviewAnalytics() {
        log.info("Fetching review analytics");
        
        List<Review> allReviews = reviewRepository.findAll();
        double averageRating = allReviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalReviews", allReviews.size());
        analytics.put("averageRating", averageRating);
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderStatusDistribution() {
        log.info("Fetching order status distribution");
        
        List<Order> allOrders = orderRepository.findAll();
        
        Map<String, Object> distribution = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            long count = allOrders.stream()
                    .filter(o -> o.getStatus() == status)
                    .count();
            distribution.put(status.toString(), count);
        }
        
        return distribution;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopSellingProducts(int limit) {
        log.info("Fetching top {} selling products", limit);
        
        List<Order> deliveredOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED);
        
        return deliveredOrders.stream()
                .flatMap(order -> order.getItems() != null ? order.getItems().stream() : java.util.stream.Stream.empty())
                .collect(Collectors.groupingBy(
                        item -> item.getProductId(),
                        Collectors.summingInt(item -> item.getQuantity())
                ))
                .entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> productInfo = new HashMap<>();
                    productInfo.put("productId", entry.getKey());
                    productInfo.put("quantitySold", entry.getValue());
                    return productInfo;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopRatedProducts(int limit) {
        log.info("Fetching top {} rated products", limit);
        
        return reviewRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        Review::getProductId,
                        Collectors.averagingDouble(Review::getRating)
                ))
                .entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> productInfo = new HashMap<>();
                    productInfo.put("productId", entry.getKey());
                    productInfo.put("averageRating", entry.getValue());
                    return productInfo;
                })
                .collect(Collectors.toList());
    }
}
