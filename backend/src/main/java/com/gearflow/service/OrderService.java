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
import com.gearflow.repository.ProductRepository;
import com.gearflow.repository.ProductVariantRepository;
import com.gearflow.repository.UserRepository;
import com.gearflow.repository.ShippingAddressRepository;
import com.gearflow.repository.PaymentRepository;
import com.gearflow.entity.ShippingAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final ShippingAddressRepository addressRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

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

        // Handle shipping info
        String fullName = request.getShippingFullName();
        String phone = request.getShippingPhone();
        String email = request.getShippingEmail();
        String addressLine = request.getShippingAddress();
        String ward = request.getShippingWard();
        String district = request.getShippingDistrict();
        String city = request.getShippingCity();
        String postalCode = request.getShippingPostalCode();

        // If addressId is provided, override with data from repository
        if (request.getAddressId() != null && !request.getAddressId().trim().isEmpty()) {
            ShippingAddress savedAddress = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found: " + request.getAddressId()));
            fullName = savedAddress.getFullName();
            phone = savedAddress.getPhone();
            email = savedAddress.getEmail();
            addressLine = savedAddress.getAddress();
            ward = savedAddress.getWard();
            district = savedAddress.getDistrict();
            city = savedAddress.getCity();
            postalCode = savedAddress.getPostalCode();
        }

        // Validate basic shipping info
        if (addressLine == null || addressLine.trim().isEmpty()) {
            throw new BusinessException("Shipping address is required");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new BusinessException("Shipping phone is required");
        }

        // Create order
        Order order = Order.builder()
                .id(java.util.UUID.randomUUID().toString())
                .userId(user.getId())
                .status(Order.OrderStatus.PENDING)
                .shippingFullName(fullName)
                .shippingEmail(email)
                .shippingPhone(phone)
                .shippingAddress(addressLine)
                .shippingWard(ward)
                .shippingDistrict(district)
                .shippingCity(city)
                .shippingPostalCode(postalCode)
                .build();

        // Filter cart items if variantIds provided
        var itemsToOrder = cartDTO.getItems();
        if (request.getVariantIds() != null && !request.getVariantIds().isEmpty()) {
            itemsToOrder = itemsToOrder.stream()
                    .filter(i -> request.getVariantIds().contains(i.getVariantId()))
                    .collect(java.util.stream.Collectors.toList());
        }

        if (itemsToOrder.isEmpty()) {
            throw new BusinessException("No items to order");
        }

        java.math.BigDecimal totalAmount = itemsToOrder.stream()
                .map(i -> i.getPrice().multiply(java.math.BigDecimal.valueOf(i.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        order.setTotalAmount(totalAmount);

        // Add items
        for (var cartItem : itemsToOrder) {
            variantRepository.findById(cartItem.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

            if (!productService.canReserve(cartItem.getVariantId(), cartItem.getQuantity())) {
                throw new BusinessException("Insufficient stock for variant " + cartItem.getVariantId());
            }
            productService.reserveStock(cartItem.getVariantId(), cartItem.getQuantity());

            OrderItem item = OrderItem.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .orderId(order.getId())
                    .productId(cartItem.getProductId())
                    .variantId(cartItem.getVariantId())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                .build();
            order.getItems().add(item);
        }

        order = orderRepository.save(order);
        
        // Remove only ordered items from cart
        for (var cartItem : itemsToOrder) {
            cartService.removeItem(userId, cartItem.getVariantId());
        }

        // Notify Admins about new order
        notifyAdmins("Đơn hàng mới", "Có một đơn hàng mới #" + order.getId().substring(0, 8) + " vừa được tạo.");

        // Notify User about their own new order
        notificationService.createNotification(userId, "ORDER", "Đặt hàng thành công", 
            "Cảm ơn bạn đã đặt hàng! Đơn hàng #" + order.getId().substring(0, 8) + " của bạn đã được tiếp nhận.");

        log.info("Order created with ID: {}", order.getId());
        return toDTO(order);
    }

    private void notifyAdmins(String title, String message) {
        userRepository.findByRole(User.UserRole.ADMIN).forEach(admin -> {
            notificationService.createNotification(admin.getId(), "SYSTEM", title, message);
        });
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

        // If transitioning to CANCELLED or RETURNED, restore stock
        if (newStatus == Order.OrderStatus.CANCELLED || newStatus == Order.OrderStatus.RETURNED) {
            handleStockRestoration(order);
        }
        
        // If transitioning TO SHIPPED or DELIVERED from a reserved state, commit the stock
        if ((newStatus == Order.OrderStatus.SHIPPED || newStatus == Order.OrderStatus.DELIVERED) &&
            (order.getStatus() == Order.OrderStatus.PENDING || 
             order.getStatus() == Order.OrderStatus.CONFIRMED || 
             order.getStatus() == Order.OrderStatus.PROCESSING)) {
            commitStock(order);
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        // Notify user about status change
        String statusMessage = getStatusMessage(newStatus);
        notificationService.createNotification(order.getUserId(), "ORDER", "Cập nhật đơn hàng", 
            "Đơn hàng #" + order.getId().substring(0, 8) + " " + statusMessage);

        // Notify admins if delivered or cancelled
        if (newStatus == Order.OrderStatus.DELIVERED || newStatus == Order.OrderStatus.CANCELLED) {
            String adminMsg = newStatus == Order.OrderStatus.DELIVERED ? "đã được giao thành công" : "đã bị hủy";
            notifyAdmins("Cập nhật đơn hàng", "Đơn hàng #" + order.getId().substring(0, 8) + " " + adminMsg);
        }

        log.info("Order status updated successfully");
        return toDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(String orderId, String userId) {
        log.info("Cancelling order {} for user {}", orderId, userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify user owns the order
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("You can only cancel your own orders");
        }

        // Only allow cancellation of PENDING, CONFIRMED, PROCESSING, or SHIPPED orders
        if (order.getStatus() != Order.OrderStatus.PENDING 
            && order.getStatus() != Order.OrderStatus.CONFIRMED
            && order.getStatus() != Order.OrderStatus.PROCESSING
            && order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new BusinessException("Cannot cancel order in " + order.getStatus() + " status");
        }

        // Restore stock
        handleStockRestoration(order);

        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Notify user
        notificationService.createNotification(order.getUserId(), "ORDER", "Đơn hàng đã hủy", 
            "Đơn hàng #" + order.getId().substring(0, 8) + " đã được hủy theo yêu cầu của bạn.");

        // Notify admins
        notifyAdmins("Đơn hàng đã hủy", "Người dùng đã hủy đơn hàng #" + order.getId().substring(0, 8));

        log.info("Order cancelled successfully");
        return toDTO(order);
    }

    @Transactional
    public OrderDTO confirmDelivery(String orderId, String userId) {
        log.info("User {} confirming delivery for order {}", userId, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("You can only confirm delivery for your own orders");
        }

        if (order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new BusinessException("Only shipped orders can be confirmed as delivered");
        }

        order.setStatus(Order.OrderStatus.DELIVERED);
        order = orderRepository.save(order);

        // Notify user
        notificationService.createNotification(order.getUserId(), "ORDER", "Xác nhận đã nhận hàng", 
            "Cảm ơn bạn đã xác nhận nhận hàng cho đơn hàng #" + order.getId().substring(0, 8) + ". Chúc bạn hài lòng với sản phẩm!");

        // Notify admins
        notifyAdmins("Xác nhận giao hàng", "Người dùng đã xác nhận nhận hàng cho đơn hàng #" + order.getId().substring(0, 8));

        log.info("Order delivery confirmed successfully");
        return toDTO(order);
    }

    @Transactional
    public OrderDTO requestReturn(String orderId, String userId) {
        log.info("User {} requesting return for order {}", userId, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("You can only return your own orders");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Only delivered orders can be returned");
        }

        if (order.getUpdatedAt().plusDays(3).isBefore(LocalDateTime.now())) {
            throw new BusinessException("Return request must be made within 3 days of delivery");
        }

        order.setStatus(Order.OrderStatus.RETURN_REQUESTED);
        order = orderRepository.save(order);

        notificationService.createNotification(order.getUserId(), "ORDER", "Yêu cầu trả hàng", 
            "Yêu cầu trả hàng cho đơn #" + order.getId().substring(0, 8) + " đã được gửi và đang chờ duyệt.");

        notifyAdmins("Yêu cầu trả hàng mới", "Khách hàng đã yêu cầu trả hàng cho đơn #" + order.getId().substring(0, 8));

        return toDTO(order);
    }

    public java.util.List<OrderDTO> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO adminCancelOrder(String orderId) {
        log.info("Admin cancelling order with id: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot cancel a delivered order");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Order is already cancelled");
        }

        // Restore stock
        handleStockRestoration(order);

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(java.time.LocalDateTime.now());
        
        order = orderRepository.save(order);
        return toDTO(order);
    }

    private void commitStock(Order order) {
        if (order.getItems() == null) return;
        
        for (var item : order.getItems()) {
            if (item.getVariantId() != null) {
                try {
                    // Commit reserved stock (decrease actual stock)
                    productService.commitReservedStock(item.getVariantId(), item.getQuantity());
                    log.info("Committed stock for variant: {} qty: {}", item.getVariantId(), item.getQuantity());
                } catch (Exception e) {
                    log.error("Error committing stock for variant: {}", item.getVariantId(), e);
                    throw new BusinessException("Failed to commit stock for variant: " + item.getVariantId());
                }
            }
        }
    }

    private void handleStockRestoration(Order order) {
        if (order.getItems() == null) return;
        
        for (var item : order.getItems()) {
            if (item.getVariantId() != null) {
                try {
                    if (order.getStatus() == Order.OrderStatus.PENDING || 
                        order.getStatus() == Order.OrderStatus.CONFIRMED || 
                        order.getStatus() == Order.OrderStatus.PROCESSING) {
                        // For these statuses, stock was only reserved
                        productService.releaseReservedStock(item.getVariantId(), item.getQuantity());
                        log.info("Released reserved stock for variant: {} qty: {}", item.getVariantId(), item.getQuantity());
                    } else if (order.getStatus() == Order.OrderStatus.SHIPPED || 
                               order.getStatus() == Order.OrderStatus.DELIVERED) {
                        // For these statuses, stock was already decremented
                        productService.incrementStock(item.getVariantId(), item.getQuantity());
                        log.info("Incremented stock for variant: {} qty: {}", item.getVariantId(), item.getQuantity());
                    }
                } catch (Exception e) {
                    log.error("Error restoring stock for variant: {}", item.getVariantId(), e);
                }
            }
        }
    }
    
    private String getStatusMessage(Order.OrderStatus status) {
        switch (status) {
            case PENDING: return "đang chờ xác nhận";
            case CONFIRMED: return "đã xác nhận";
            case PROCESSING: return "đang chuẩn bị hàng";
            case SHIPPED: return "đang giao hàng";
            case DELIVERED: return "đã giao";
            case CANCELLED: return "đã hủy";
            case RETURN_REQUESTED: return "yêu cầu trả hàng";
            case RETURN_CONFIRMED: return "đã xác nhận yêu cầu trả hàng";
            case RETURN_INSPECTING: return "đang kiểm tra sản phẩm";
            case RETURNED: return "đã trả hàng thành công";
            case RETURN_REJECTED: return "từ chối trả hàng";
            default: return "đã được cập nhật";
        }
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        // Allow DELIVERED to RETURN_REQUESTED
        if (currentStatus == Order.OrderStatus.DELIVERED && newStatus == Order.OrderStatus.RETURN_REQUESTED) {
            return;
        }
        
        // Return flow transitions
        if (currentStatus == Order.OrderStatus.RETURN_REQUESTED && 
            (newStatus == Order.OrderStatus.RETURN_CONFIRMED || newStatus == Order.OrderStatus.RETURN_REJECTED)) {
            return;
        }
        if (currentStatus == Order.OrderStatus.RETURN_CONFIRMED && newStatus == Order.OrderStatus.RETURN_INSPECTING) {
            return;
        }
        if (currentStatus == Order.OrderStatus.RETURN_INSPECTING && 
            (newStatus == Order.OrderStatus.RETURNED || newStatus == Order.OrderStatus.RETURN_REJECTED)) {
            return;
        }

        // Cannot change status of terminal orders unless specifically allowed above
        if (currentStatus == Order.OrderStatus.CANCELLED || currentStatus == Order.OrderStatus.RETURNED || currentStatus == Order.OrderStatus.RETURN_REJECTED) {
            throw new BusinessException("Cannot change status of completed order");
        }
        
        // Allow cancellation from almost anywhere before completion
        if (newStatus == Order.OrderStatus.CANCELLED && 
            (currentStatus == Order.OrderStatus.PENDING || 
             currentStatus == Order.OrderStatus.CONFIRMED || 
             currentStatus == Order.OrderStatus.PROCESSING || 
             currentStatus == Order.OrderStatus.SHIPPED)) {
            return;
        }

        // Validate logical forward flow
        switch (currentStatus) {
            case PENDING:
                if (newStatus != Order.OrderStatus.CONFIRMED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("PENDING order can only move to CONFIRMED or CANCELLED");
                }
                break;
            case CONFIRMED:
                if (newStatus != Order.OrderStatus.PROCESSING && newStatus != Order.OrderStatus.SHIPPED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("CONFIRMED order can move to PROCESSING, SHIPPED or CANCELLED");
                }
                break;
            case PROCESSING:
                if (newStatus != Order.OrderStatus.SHIPPED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("PROCESSING order can move to SHIPPED or CANCELLED");
                }
                break;
            case SHIPPED:
                if (newStatus != Order.OrderStatus.DELIVERED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new BusinessException("SHIPPED order can only transition to DELIVERED or CANCELLED");
                }
                break;
        }
    }

    public OrderDTO toDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus().toString())
                .paymentMethod(paymentRepository.findByOrderId(order.getId()).map(p -> p.getPaymentMethod().name()).orElse("COD"))
                .totalAmount(order.getTotalAmount())
                .shippingFullName(order.getShippingFullName())
                .shippingEmail(order.getShippingEmail())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .shippingWard(order.getShippingWard())
                .shippingDistrict(order.getShippingDistrict())
                .shippingCity(order.getShippingCity())
                .shippingPostalCode(order.getShippingPostalCode())
                .items(order.getItems() != null ? order.getItems().stream()
                        .map(item -> OrderItemDTO.builder()
                                .id(item.getId())
                                .orderId(item.getOrderId())
                                .productId(item.getProductId())
                                .variantId(item.getVariantId())
                                .productName(productRepository.findById(item.getProductId()).map(com.gearflow.entity.Product::getName).orElse(null))
                                .imageUrl(productRepository.findById(item.getProductId()).map(com.gearflow.entity.Product::getImageUrl).orElse(null))
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subtotal(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                                .build())
                        .collect(Collectors.toList()) : java.util.Collections.<OrderItemDTO>emptyList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
