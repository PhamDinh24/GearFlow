package com.gearflow.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts", indexes = {
    @Index(name = "idx_carts_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @Column(name = "cart_id", length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 36)
    private String userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addItem(CartItem item) {
        items.stream()
            .filter(i -> i.getVariantId().equals(item.getVariantId()))
            .findFirst()
            .ifPresentOrElse(
                existing -> existing.setQuantity(existing.getQuantity() + item.getQuantity()),
                () -> {
                    item.setCart(this);
                    items.add(item);
                }
            );
    }

    public void removeItem(String variantId) {
        items.removeIf(i -> i.getVariantId().equals(variantId));
    }

    public void updateItemQuantity(String variantId, Integer quantity) {
        items.stream()
            .filter(i -> i.getVariantId().equals(variantId))
            .findFirst()
            .ifPresent(i -> i.setQuantity(quantity));
    }

    public void clear() {
        items.clear();
    }
}
