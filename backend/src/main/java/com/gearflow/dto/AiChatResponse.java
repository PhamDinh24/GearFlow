package com.gearflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiChatResponse {
    private String content;
    private List<ProductSuggestion> suggestions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductSuggestion {
        private String id;
        private String name;
        private String imageUrl;
        private Long price;
        private String brandName;
    }
}
