package com.gearflow.service;

import com.gearflow.dto.OrderDTO;
import com.gearflow.entity.Order;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderManagementService {
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final StockService stockService;

    public java.util.List<OrderDTO> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(orderService::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public OrderDTO cancelOrder(String orderId) {
        log.info("Cancelling order with id: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot cancel a delivered order");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Order is already cancelled");
        }

        // Restore stock for cancelled order
        for (var item : order.getItems()) {
            stockService.incrementStock(item.getVariantId(), item.getQuantity());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updated = orderRepository.save(order);
        log.info("Order cancelled with id: {}", orderId);
        return orderService.toDTO(updated);
    }

    @Transactional
    public OrderDTO updateOrderStatus(String orderId, Order.OrderStatus newStatus) {
        log.info("Updating order status for id: {} to: {}", orderId, newStatus);
        
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new BusinessException("Order ID is required");
        }
        if (newStatus == null) {
            throw new BusinessException("New status is required");
        }
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Validate status transition
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot change status of delivered order");
        }
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot change status of cancelled order");
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updated = orderRepository.save(order);
        log.info("Order status updated for id: {}", orderId);
        return orderService.toDTO(updated);
    }
}
