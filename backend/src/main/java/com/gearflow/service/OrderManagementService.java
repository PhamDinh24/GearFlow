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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderManagementService {
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final StockService stockService;
    private final PaymentService paymentService;

    public List<OrderDTO> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(orderService::toDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrder(String orderId) {
        log.info("Fetching order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        return orderService.toDTO(order);
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
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                if (item.getVariantId() != null) {
                    try {
                        stockService.incrementStock(item.getVariantId(), item.getQuantity());
                        log.info("Stock restored for variant: {} quantity: {}", item.getVariantId(), item.getQuantity());
                    } catch (Exception e) {
                        log.error("Error restoring stock for variant: {}", item.getVariantId(), e);
                    }
                }
            }
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
        validateStatusTransition(order.getStatus(), newStatus);

        log.info("Status transition valid: {} -> {}", order.getStatus(), newStatus);
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updated = orderRepository.save(order);
        log.info("Order status updated for id: {} to: {}", orderId, newStatus);
        return orderService.toDTO(updated);
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        // Cannot change if already completed
        if (currentStatus == Order.OrderStatus.DELIVERED || currentStatus == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot change status of completed order");
        }
        
        // Define valid transitions
        switch(currentStatus) {
            case PENDING:
                if (newStatus != Order.OrderStatus.CONFIRMED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("From PENDING, can only go to CONFIRMED or CANCELLED");
                }
                break;
            case CONFIRMED:
                if (newStatus != Order.OrderStatus.PROCESSING && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("From CONFIRMED, can only go to PROCESSING or CANCELLED");
                }
                break;
            case PROCESSING:
                if (newStatus != Order.OrderStatus.SHIPPED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("From PROCESSING, can only go to SHIPPED or CANCELLED");
                }
                break;
            case SHIPPED:
                if (newStatus != Order.OrderStatus.DELIVERED) {
                    throw new BusinessException("From SHIPPED, can only go to DELIVERED");
                }
                break;
            default:
                throw new BusinessException("Unknown order status: " + currentStatus);
        }
    }
}
