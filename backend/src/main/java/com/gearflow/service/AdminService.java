package com.gearflow.service;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Cacheable(value = "dashboard_stats")
    public Map<String, Object> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        
        List<Order> allOrders = orderRepository.findAll();
        
        long totalOrders = allOrders.size();
        java.math.BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        
        long newUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("newUsers", newUsers);
        stats.put("averageOrderValue", totalOrders > 0 ? totalRevenue.divide(java.math.BigDecimal.valueOf(totalOrders)) : 0);
        
        return stats;
    }

    @Cacheable(value = "top_products")
    public List<Map<String, Object>> getTopProducts(int limit) {
        log.info("Fetching top {} products", limit);
        
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
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO updateOrderStatus(String orderId, String status) {
        log.info("Updating order {} status to {}", orderId, status);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.gearflow.exception.ResourceNotFoundException("Order not found: " + orderId));
        
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            Order updated = orderRepository.save(order);
            log.info("Order status updated successfully");
            return convertToDTO(updated);
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", status);
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }

    private OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus().toString())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
