package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {
    private String id;
    private String code;
    private String description;
    private BigDecimal discountAmount;
    private Integer discountPercentage;
    private BigDecimal minOrderAmount;
    private Integer maxUsageCount;
    private Integer currentUsageCount;
    private LocalDateTime expiryDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
