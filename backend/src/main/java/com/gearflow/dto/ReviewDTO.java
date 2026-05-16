package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {

    private String id;
    private String userId;
    private String productId;
    private String orderItemId;

    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
    private String userName; // Thêm trường userName
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
