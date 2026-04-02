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
public class AttributeDefinitionDTO {
    private String id;
    private String name;
    private String displayName;
    private String type;
    private String unit;
    private Boolean filterable;
    private Boolean variantAttribute;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
