package com.gearflow.controller;

import com.gearflow.dto.OrderDTO;
import com.gearflow.dto.OrderRequest;
import com.gearflow.entity.Order;
import com.gearflow.security.UserPrincipal;
import com.gearflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody OrderRequest request) {
        log.info("POST /api/orders - User: {}", user.getId());
        OrderDTO order = orderService.createOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable String orderId) {
        log.info("GET /api/orders/{}", orderId);
        OrderDTO order = orderService.getOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(
            @AuthenticationPrincipal UserPrincipal user) {
        log.info("GET /api/orders - User: {}", user.getId());
        Page<OrderDTO> ordersPage = orderService.getUserOrders(user.getId(), Pageable.unpaged());
        return ResponseEntity.ok(ordersPage.getContent());
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam Order.OrderStatus status) {
        log.info("PUT /api/orders/{}/status - New status: {}", orderId, status);
        OrderDTO order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }
}
