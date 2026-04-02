package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.gearflow.dto.ProductDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDTO {
    private String id;
    private String userId;
    private String productId;
    private String productName;
    private Double price;
    private LocalDateTime addedAt;
    private ProductDTO product;
}
