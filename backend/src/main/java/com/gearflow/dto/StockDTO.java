package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockDTO {
    private String variantId;
    private Integer quantity;
    private Integer reserved;
    private Integer available;
    private LocalDateTime updatedAt;
}
