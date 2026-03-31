package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

    private String id;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private String categoryId;
    private String brandId;
    private String support;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ProductVariantDTO> variants;
    private List<ProductAttributeDTO> attributes;
    private Double averageRating;
    private Integer reviewCount;
    private Integer stock;
}
