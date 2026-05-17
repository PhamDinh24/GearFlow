package com.gearflow.dto;

import lombok.Data;

@Data
public class AiDescriptionRequest {
    private String name;
    private String brand;
    private String switchType;
    private String layout;
    private String extraFeatures;
}
