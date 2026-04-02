package com.gearflow.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attribute_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeDefinition {

    @Id
    @Column(name = "attr_def_id", length = 36)
    private String id;

    @Column(name = "attr_name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "attr_display_name", nullable = false, length = 200)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "attr_type", nullable = false, length = 50)
    @Builder.Default
    private AttributeType type = AttributeType.TEXT;

    @Column(name = "attr_unit", length = 20)
    private String unit;

    @Column(name = "is_filterable")
    @Builder.Default
    private Boolean filterable = false;

    @Column(name = "is_variant_attribute")
    @Builder.Default
    private Boolean variantAttribute = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AttributeType {
        TEXT,    // Text input
        NUMBER,  // Numeric input
        SELECT,  // Dropdown selection
        COLOR    // Color picker
    }
}
