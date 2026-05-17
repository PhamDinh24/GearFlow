package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {

    @NotBlank(message = "Variant ID is required")
    private String variantId;

    private String productId;
    private String productName;
    private String imageUrl;
    private String variantDetails; // e.g., "Red, Cherry MX Blue"

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal price;
    private BigDecimal subtotal;
    private Integer stock;
}
