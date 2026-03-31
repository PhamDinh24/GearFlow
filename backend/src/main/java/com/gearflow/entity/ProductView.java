package com.gearflow.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_views", indexes = {
    @Index(name = "idx_product_views_user", columnList = "user_id"),
    @Index(name = "idx_product_views_product", columnList = "product_id"),
    @Index(name = "idx_product_views_created_at", columnList = "viewed_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductView {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    @CreationTimestamp
    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt;
}
