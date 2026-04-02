package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDTO {

    private String id;
    private String productId;
    private String switchType;
    private String color;
    private String keycapSet;
    private String connectionType;
    private BigDecimal priceModifier;
    private BigDecimal finalPrice;
    private Integer availableStock;
    private Integer stock;
    private Boolean inStock;
}
