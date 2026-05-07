package com.gearflow.service;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.ProductRepository;
import com.gearflow.repository.ReviewRepository;
import com.gearflow.repository.UserRepository;
import com.gearflow.entity.Product;
import com.gearflow.entity.Review;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;

    // Analytics Methods
    @Transactional(readOnly = true)
    public List<com.gearflow.dto.PaymentDTO> getAllPayments() {
        log.info("Admin fetching all payments");
        return paymentService.getAllPayments();
    }
    @Transactional(readOnly = true)
    @Cacheable(value = "product_analytics")
    public Map<String, Object> getProductAnalytics() {
        log.info("Fetching product analytics");
        List<Product> allProducts = productRepository.findAll();
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalProducts", allProducts.size());
        analytics.put("outOfStock", allProducts.stream().filter(p -> p.getVariants() == null || p.getVariants().isEmpty()).count());
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReviewAnalytics() {
        log.info("Fetching review analytics");
        List<Review> allReviews = reviewRepository.findAll();
        double averageRating = allReviews.stream().mapToDouble(Review::getRating).average().orElse(0.0);
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
            distribution.put(status.toString(), allOrders.stream().filter(o -> o.getStatus() == status).count());
        }
        return distribution;
    }

    // Bulk Operation Methods
    @Transactional
    @CacheEvict(value = "top_products", allEntries = true)
    public void bulkDeleteProducts(List<String> productIds) {
        log.info("Bulk deleting {} products", productIds.size());
        List<Product> products = productRepository.findAllById(productIds);
        productRepository.deleteAll(products);
    }

    @Transactional
    public void bulkUpdateProductCategory(List<String> productIds, String categoryId) {
        log.info("Bulk updating category for {} products", productIds.size());
        List<Product> products = productRepository.findAllById(productIds);
        products.forEach(product -> product.setCategoryId(categoryId));
        productRepository.saveAll(products);
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

    // Export Methods
    @Transactional(readOnly = true)
    public byte[] exportOrdersAsCSV() {
        log.info("Exporting orders as CSV");
        List<Order> orders = orderRepository.findAll();
        java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
        try (java.io.PrintWriter writer = new java.io.PrintWriter(outputStream)) {
            writer.println("Order ID,User ID,Status,Total Amount,Created At");
            for (Order order : orders) {
                writer.printf("%s,%s,%s,%s,%s%n", order.getId(), order.getUserId(), order.getStatus(), order.getTotalAmount(), order.getCreatedAt());
            }
            writer.flush();
        }
        return outputStream.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportProductsAsCSV() {
        log.info("Exporting products as CSV");
        List<Product> products = productRepository.findAll();
        java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
        try (java.io.PrintWriter writer = new java.io.PrintWriter(outputStream)) {
            writer.println("Product ID,Name,Price,Category ID");
            for (Product product : products) {
                writer.printf("%s,%s,%s,%s%n", product.getId(), escapeCSV(product.getName()), product.getBasePrice(), product.getCategoryId());
            }
            writer.flush();
        }
        return outputStream.toByteArray();
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @Cacheable(value = "dashboard_stats")
    public Map<String, Object> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        
        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();

        // Revenue only from successfully DELIVERED orders
        java.math.BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        
        long totalUsers = userRepository.count();
        long newUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalUsers", totalUsers);
        stats.put("newUsers", newUsers);
        stats.put("deliveredOrders", allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED).count());
        stats.put("pendingOrders", allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PENDING).count());
        stats.put("averageOrderValue", totalOrders > 0 ? totalRevenue.divide(java.math.BigDecimal.valueOf(totalOrders), 0, java.math.RoundingMode.HALF_UP) : 0);
        
        return stats;
    }

    @Cacheable(value = "top_products")
    public List<Map<String, Object>> getTopProducts(int limit) {
        log.info("Fetching top {} products", limit);
        
        List<Order> deliveredOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED);
        
        // Group by productId, sum quantity and revenue
        Map<String, long[]> productStats = new HashMap<>(); // [quantity, revenue*100]
        for (Order order : deliveredOrders) {
            if (order.getItems() == null) continue;
            for (var item : order.getItems()) {
                String pid = item.getProductId();
                long qty = item.getQuantity();
                long rev = item.getPrice() != null ? item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).longValue() : 0;
                productStats.merge(pid, new long[]{qty, rev}, (a, b) -> new long[]{a[0]+b[0], a[1]+b[1]});
            }
        }
        
        return productStats.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("productId", entry.getKey());
                    info.put("totalSold", entry.getValue()[0]);
                    info.put("totalRevenue", entry.getValue()[1]);
                    // Enrich with product name
                    productRepository.findById(entry.getKey()).ifPresent(p -> {
                        info.put("productName", p.getName());
                        info.put("imageUrl", p.getImageUrl());
                        info.put("brandId", p.getBrandId());
                    });
                    return info;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopBrands(int limit) {
        log.info("Fetching top {} brands", limit);
        
        List<Order> deliveredOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED);
        
        // Group by brandId via product lookup
        Map<String, long[]> brandStats = new HashMap<>();
        for (Order order : deliveredOrders) {
            if (order.getItems() == null) continue;
            for (var item : order.getItems()) {
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    String brandId = product.getBrandId();
                    if (brandId == null) return;
                    long qty = item.getQuantity();
                    long rev = item.getPrice() != null ? item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).longValue() : 0;
                    brandStats.merge(brandId, new long[]{qty, rev}, (a, b) -> new long[]{a[0]+b[0], a[1]+b[1]});
                });
            }
        }
        
        return brandStats.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("brandId", entry.getKey());
                    info.put("totalSold", entry.getValue()[0]);
                    info.put("totalRevenue", entry.getValue()[1]);
                    // Enrich with brand name
                    try {
                        var brands = productRepository.findAll().stream()
                            .filter(p -> entry.getKey().equals(p.getBrandId()))
                            .findFirst();
                        // Use brandId as name fallback
                        info.put("brandName", entry.getKey());
                    } catch (Exception e) {
                        info.put("brandName", entry.getKey());
                    }
                    return info;
                })
                .collect(Collectors.toList());
    }

    @Cacheable(value = "sales_report")
    public Map<String, Object> getSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Generating sales report from {} to {}", startDate, endDate);
        
        List<Order> ordersInRange = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(startDate) && o.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        java.math.BigDecimal totalSales = ordersInRange.stream()
                .map(Order::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        long totalOrders = ordersInRange.size();
        long completedOrders = ordersInRange.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .count();

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalSales", totalSales);
        report.put("totalOrders", totalOrders);
        report.put("completedOrders", completedOrders);
        report.put("averageOrderValue", totalOrders > 0 ? totalSales.divide(java.math.BigDecimal.valueOf(totalOrders)) : 0);
        report.put("conversionRate", totalOrders > 0 ? (double) completedOrders / totalOrders : 0);
        
        return report;
    }

    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        log.info("Fetching orders with status: {}", status);
        if (status == null) {
            // Return all orders if no status specified
            return orderRepository.findAll().stream()
                    .map(orderService::toDTO)
                    .collect(Collectors.toList());
        }
        return orderRepository.findByStatus(status).stream()
                .map(orderService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "dashboard_stats", allEntries = true)
    public OrderDTO updateOrderStatus(String orderId, String status) {
        log.info("Updating order {} status to {}", orderId, status);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.gearflow.exception.ResourceNotFoundException("Order not found: " + orderId));
        
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            Order updated = orderRepository.save(order);
            log.info("Order status updated successfully");
            return orderService.toDTO(updated);
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", status);
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }

    public List<OrderDTO> getOrdersByStatusDetailed(Order.OrderStatus status) {
        log.info("Fetching detailed orders with status: {}", status);
        if (status == null) {
            return orderRepository.findAll().stream()
                    .map(orderService::toDTO)
                    .collect(Collectors.toList());
        }
        return orderRepository.findByStatus(status).stream()
                .map(orderService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO adminCancelOrder(String orderId) {
        log.info("Delegating admin cancel order {} to OrderService", orderId);
        return orderService.adminCancelOrder(orderId);
    }
}
