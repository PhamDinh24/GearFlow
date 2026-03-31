package com.gearflow.service;

import com.gearflow.dto.CartDTO;
import com.gearflow.dto.OrderDTO;
import com.gearflow.dto.OrderItemDTO;
import com.gearflow.dto.OrderRequest;
import com.gearflow.entity.Order;
import com.gearflow.entity.OrderItem;
import com.gearflow.entity.User;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.OrderRepository;
import com.gearflow.repository.ProductVariantRepository;
import com.gearflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final CartService cartService;

    @Transactional
    public OrderDTO createOrder(String userId, OrderRequest request) {
        log.info("Creating order for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get cart
        CartDTO cartDTO = cartService.getCart(userId);
        if (cartDTO.getItems() == null || cartDTO.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        // Create order
        Order order = Order.builder()
                .id(java.util.UUID.randomUUID().toString())
                .userId(user.getId())
                .status(Order.OrderStatus.PENDING)
                .totalAmount(cartDTO.getTotalPrice())
                .build();

        // Add items
        for (var cartItem : cartDTO.getItems()) {
            variantRepository.findById(cartItem.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

            OrderItem item = OrderItem.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .orderId(order.getId())
                    .productId(cartItem.getProductId())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                .build();
            order.getItems().add(item);
        }

        order = orderRepository.save(order);
        cartService.clearCart(userId);

        log.info("Order created with ID: {}", order.getId());
        return toDTO(order);
    }

    public OrderDTO getOrder(String orderId) {
        log.info("Fetching order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toDTO(order);
    }

    public Page<OrderDTO> getUserOrders(String userId, Pageable pageable) {
        log.info("Fetching orders for user: {}", userId);
        return orderRepository.findByUserId(userId, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public OrderDTO updateOrderStatus(String orderId, Order.OrderStatus newStatus) {
        log.info("Updating order {} status to {}", orderId, newStatus);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        log.info("Order status updated successfully");
        return toDTO(order);
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        if (currentStatus == Order.OrderStatus.DELIVERED || currentStatus == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot change status of completed order");
        }
        if (currentStatus == Order.OrderStatus.PENDING && newStatus != Order.OrderStatus.CONFIRMED && newStatus != Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Invalid status transition");
        }
    }

    private OrderDTO toDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus().toString())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems() != null ? order.getItems().stream()
                        .map(item -> OrderItemDTO.builder()
                                .id(item.getId())
                                .orderId(item.getOrderId())
                                .productId(item.getProductId())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subtotal(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                                .build())
                        .collect(Collectors.toList()) : java.util.Collections.emptyList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
