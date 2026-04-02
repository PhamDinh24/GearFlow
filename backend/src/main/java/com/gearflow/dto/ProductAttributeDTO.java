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
public class ProductAttributeDTO {

    private String id;
    private String productId;
    private String name;
    private String value;
    private BigDecimal priceAdjustment;
    private String attributeDefinitionId;
    private String displayName;
    private String type;
    private String unit;
}
