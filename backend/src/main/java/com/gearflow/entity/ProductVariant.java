package com.gearflow.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants", indexes = {
    @Index(name = "idx_product_variants_product", columnList = "product_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @Column(name = "pro_variant_id", length = 36)
    private String id;

    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    @Column(name = "switch_type", length = 50)
    private String switchType;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "keycap_set", length = 100)
    private String keycapSet;

    @Column(name = "connect_type", length = 100)
    private String connectionType;

    @Column(name = "price_modifier")
    @Builder.Default
    private BigDecimal priceModifier = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
