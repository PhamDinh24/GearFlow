package com.keyboard.dto;

import com.keyboard.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String brand;
    private String switchType;
    private String layout;
    private Boolean wireless;
    private Boolean rgb;
    private String imageUrl;

    public static ProductDTO fromEntity(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setBrand(product.getBrand());
        dto.setSwitchType(product.getSwitchType() != null ? product.getSwitchType().toString() : null);
        dto.setLayout(product.getLayout());
        dto.setWireless(product.getWireless());
        dto.setRgb(product.getRgb());
        dto.setImageUrl(product.getImageUrl());
        return dto;
    }
}
