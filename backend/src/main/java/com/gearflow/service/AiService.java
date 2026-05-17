package com.gearflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gearflow.dto.AiChatResponse;
import com.gearflow.dto.AiDescriptionRequest;
import com.gearflow.dto.ProductDTO;
import com.gearflow.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${groq.api.key:}")
    private String apiKey;

    private final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final String MODEL = "llama-3.3-70b-versatile"; // Model mạnh và nhanh

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ProductRepository productRepository;
    private final ProductService productService;

    public AiChatResponse getChatResponseWithSuggestions(String userMessage) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_api_key_here")) {
            return new AiChatResponse(
                "Xin lỗi, hệ thống chưa được cấu hình API Key. Vui lòng thêm groq.api.key vào file application.yml",
                new ArrayList<>()
            );
        }
        
        // Tìm kiếm sản phẩm liên quan với logic thông minh
        List<AiChatResponse.ProductSuggestion> suggestions = findRelevantProducts(userMessage);
        
        // Tạo context về sản phẩm cho AI với thông tin chi tiết hơn
        String productContext = "";
        if (!suggestions.isEmpty()) {
            productContext = "\n\nCác sản phẩm phù hợp với yêu cầu:\n" + 
                suggestions.stream()
                    .map(p -> String.format("- %s (%s) - Giá: %,dđ", 
                        p.getName(), p.getBrandName(), p.getPrice()))
                    .collect(Collectors.joining("\n"));
        }
        
        String systemPrompt = "Bạn là trợ lý AI chuyên nghiệp của GearFlow - cửa hàng bàn phím cơ hàng đầu. " +
                "Nhiệm vụ của bạn:\n" +
                "1. Tư vấn nhiệt tình, chuyên nghiệp và chi tiết về bàn phím cơ\n" +
                "2. Giải thích rõ ràng về các loại switch, layout, tính năng\n" +
                "3. Đề xuất sản phẩm phù hợp với nhu cầu và ngân sách\n" +
                "4. So sánh sản phẩm khi được hỏi\n" +
                "5. Trả lời ngắn gọn (2-3 câu) nhưng đầy đủ thông tin\n" +
                "6. Luôn đề cập đến tên sản phẩm cụ thể khi gợi ý" + productContext;
        
        String aiResponse = callGroq(systemPrompt, userMessage);
        
        return new AiChatResponse(aiResponse, suggestions);
    }
    
    public String getChatResponse(String userMessage) {
        AiChatResponse response = getChatResponseWithSuggestions(userMessage);
        return response.getContent();
    }
    
    private List<AiChatResponse.ProductSuggestion> findRelevantProducts(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        List<ProductDTO> products = new ArrayList<>();
        
        // 1. TÌM THEO THƯƠNG HIỆU - Tìm động trong database thay vì hardcode
        List<ProductDTO> brandResults = searchByBrand(lowerMessage);
        if (!brandResults.isEmpty()) {
            products = brandResults;
        }
        
        // 2. TÌM THEO TÊN SẢN PHẨM CỤ THỂ
        else if (containsProductKeywords(lowerMessage)) {
            products = searchByProductName(lowerMessage);
        }
        
        // 3. TÌM THEO SWITCH TYPE
        else if (containsSwitchKeywords(lowerMessage)) {
            products = searchBySwitch(lowerMessage);
        }
        
        // 4. TÌM THEO LAYOUT
        else if (containsLayoutKeywords(lowerMessage)) {
            products = searchByLayout(lowerMessage);
        }
        
        // 5. TÌM THEO KẾT NỐI
        else if (containsConnectionKeywords(lowerMessage)) {
            products = searchByConnection(lowerMessage);
        }
        
        // 6. TÌM THEO MỤC ĐÍCH SỬ DỤNG
        else if (lowerMessage.contains("gaming") || lowerMessage.contains("game") || lowerMessage.contains("chơi game")) {
            products = productRepository.findByNameContainingIgnoreCase("gaming", PageRequest.of(0, 3))
                .stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
        } 
        else if (lowerMessage.contains("văn phòng") || lowerMessage.contains("office") || lowerMessage.contains("làm việc")) {
            products = productRepository.findByNameContainingIgnoreCase("office", PageRequest.of(0, 3))
                .stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
        }
        
        // 7. TÌM THEO KHOẢNG GIÁ
        else if (lowerMessage.contains("rẻ") || lowerMessage.contains("giá tốt") || lowerMessage.contains("budget") || 
                 lowerMessage.contains("dưới") || lowerMessage.contains("under")) {
            products = searchByPriceRange(lowerMessage, true);
        } 
        else if (lowerMessage.contains("cao cấp") || lowerMessage.contains("premium") || lowerMessage.contains("đắt") ||
                 lowerMessage.contains("trên") || lowerMessage.contains("over")) {
            products = searchByPriceRange(lowerMessage, false);
        }
        
        // 8. TÌM THEO ĐẶC ĐIỂM
        else if (lowerMessage.contains("wireless") || lowerMessage.contains("không dây") || lowerMessage.contains("bluetooth")) {
            products = searchByFeature("wireless");
        }
        else if (lowerMessage.contains("rgb") || lowerMessage.contains("led") || lowerMessage.contains("đèn")) {
            products = searchByFeature("rgb");
        }
        else if (lowerMessage.contains("hot swap") || lowerMessage.contains("hotswap") || lowerMessage.contains("thay switch")) {
            products = searchByFeature("hot");
        }
        
        // 9. TÌM TẤT CẢ / MỚI NHẤT
        else if (lowerMessage.contains("tất cả") || lowerMessage.contains("all") || lowerMessage.contains("danh sách") ||
                 lowerMessage.contains("có gì") || lowerMessage.contains("mới")) {
            products = productService.getLatestProducts(3);
        }
        
        // 10. TÌM KIẾM CHUNG - Tìm trong tên và mô tả
        else {
            products = searchGeneral(lowerMessage);
        }
        
        // Nếu không tìm thấy gì, trả về sản phẩm phổ biến nhất
        if (products.isEmpty()) {
            products = productService.getLatestProducts(3);
        }
        
        // Convert to suggestions và giới hạn 3 sản phẩm
        return products.stream()
            .limit(3)
            .map(p -> new AiChatResponse.ProductSuggestion(
                p.getId(),
                p.getName(),
                p.getImageUrl(),
                p.getBasePrice().longValue(),
                p.getBrandName()
            ))
            .collect(Collectors.toList());
    }
    
    // Helper methods cho tìm kiếm thông minh
    
    private List<ProductDTO> searchByBrand(String message) {
        // Tìm tất cả brands trong database
        try {
            List<ProductDTO> allProducts = productRepository.findAll(PageRequest.of(0, 100))
                .stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
            
            // Lấy danh sách brand names unique
            Set<String> brandNames = allProducts.stream()
                .map(p -> p.getBrandName() != null ? p.getBrandName().toLowerCase() : "")
                .filter(b -> !b.isEmpty())
                .collect(Collectors.toSet());
            
            // Tìm brand nào match với message
            for (String brandName : brandNames) {
                if (message.contains(brandName)) {
                    return productRepository.findByBrandNameContainingIgnoreCase(brandName, PageRequest.of(0, 3))
                        .stream()
                        .map(productService::convertToDTO)
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            log.error("Error searching by brand: ", e);
        }
        return new ArrayList<>();
    }
    
    private boolean containsProductKeywords(String message) {
        String[] keywords = {"k2", "k8", "q1", "one 2", "one 3", "fc660", "fc750", "blackwidow", "k70", "g512"};
        for (String keyword : keywords) {
            if (message.contains(keyword)) return true;
        }
        return false;
    }
    
    private List<ProductDTO> searchByProductName(String message) {
        // Extract product model từ message
        String[] models = {"k2", "k8", "q1", "one 2", "one 3", "fc660", "fc750", "blackwidow", "k70", "g512"};
        for (String model : models) {
            if (message.contains(model)) {
                return productRepository.findByNameContainingIgnoreCase(model, PageRequest.of(0, 3))
                    .stream()
                    .map(productService::convertToDTO)
                    .collect(Collectors.toList());
            }
        }
        return new ArrayList<>();
    }
    
    private boolean containsSwitchKeywords(String message) {
        return message.contains("cherry") || message.contains("gateron") || message.contains("switch") ||
               message.contains("blue") || message.contains("red") || message.contains("brown") ||
               message.contains("xanh") || message.contains("đỏ") || message.contains("nâu");
    }
    
    private List<ProductDTO> searchBySwitch(String message) {
        String switchType = "";
        if (message.contains("cherry mx blue") || message.contains("blue")) switchType = "blue";
        else if (message.contains("cherry mx red") || message.contains("red")) switchType = "red";
        else if (message.contains("cherry mx brown") || message.contains("brown")) switchType = "brown";
        else if (message.contains("gateron")) switchType = "gateron";
        
        if (!switchType.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(switchType, PageRequest.of(0, 3))
                .stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
    
    private boolean containsLayoutKeywords(String message) {
        return message.contains("60%") || message.contains("65%") || message.contains("75%") ||
               message.contains("tkl") || message.contains("full size") || message.contains("compact");
    }
    
    private List<ProductDTO> searchByLayout(String message) {
        String layout = "";
        if (message.contains("60%") || message.contains("60")) layout = "60";
        else if (message.contains("65%") || message.contains("65")) layout = "65";
        else if (message.contains("75%") || message.contains("75")) layout = "75";
        else if (message.contains("tkl")) layout = "tkl";
        else if (message.contains("full")) layout = "full";
        
        if (!layout.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(layout, PageRequest.of(0, 3))
                .stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
    
    private boolean containsConnectionKeywords(String message) {
        return message.contains("wireless") || message.contains("wired") || message.contains("bluetooth") ||
               message.contains("không dây") || message.contains("có dây");
    }
    
    private List<ProductDTO> searchByConnection(String message) {
        String connection = "";
        if (message.contains("wireless") || message.contains("không dây") || message.contains("bluetooth")) {
            connection = "wireless";
        } else if (message.contains("wired") || message.contains("có dây")) {
            connection = "wired";
        }
        
        if (!connection.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(connection, PageRequest.of(0, 3))
                .stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
    
    private List<ProductDTO> searchByPriceRange(String message, boolean cheap) {
        // Extract số tiền nếu có
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)");
        java.util.regex.Matcher matcher = pattern.matcher(message);
        
        if (cheap) {
            // Tìm sản phẩm giá rẻ
            return productRepository.findAll(PageRequest.of(0, 10))
                .stream()
                .map(productService::convertToDTO)
                .sorted((a, b) -> a.getBasePrice().compareTo(b.getBasePrice()))
                .limit(3)
                .collect(Collectors.toList());
        } else {
            // Tìm sản phẩm cao cấp
            return productRepository.findAll(PageRequest.of(0, 10))
                .stream()
                .map(productService::convertToDTO)
                .sorted((a, b) -> b.getBasePrice().compareTo(a.getBasePrice()))
                .limit(3)
                .collect(Collectors.toList());
        }
    }
    
    private List<ProductDTO> searchByFeature(String feature) {
        return productRepository.findByNameContainingIgnoreCase(feature, PageRequest.of(0, 3))
            .stream()
            .map(productService::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private List<ProductDTO> searchGeneral(String message) {
        // Tìm kiếm chung trong tên và mô tả
        String[] words = message.split("\\s+");
        List<ProductDTO> results = new ArrayList<>();
        
        for (String word : words) {
            if (word.length() > 3) { // Chỉ tìm từ có ít nhất 4 ký tự
                List<ProductDTO> found = productRepository.findByNameContainingIgnoreCase(word, PageRequest.of(0, 3))
                    .stream()
                    .map(productService::convertToDTO)
                    .collect(Collectors.toList());
                results.addAll(found);
                if (!results.isEmpty()) break;
            }
        }
        
        return results.stream().distinct().limit(3).collect(Collectors.toList());
    }

    public String generateProductDescription(AiDescriptionRequest request) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_api_key_here")) {
            return "<p>Lỗi: Chưa cấu hình groq.api.key trong application.yml</p>";
        }

        String systemPrompt = "Bạn là chuyên gia viết mô tả sản phẩm bàn phím cơ. Trả về HTML thuần túy, không có markdown.";
        
        String userPrompt = String.format(
            "Viết một bài mô tả sản phẩm chuẩn SEO bằng mã HTML (chỉ trả về phần nội dung HTML, có thẻ h2, h3, p, ul li) cho bàn phím cơ sau:\n" +
            "- Tên: %s\n" +
            "- Thương hiệu: %s\n" +
            "- Switch: %s\n" +
            "- Layout: %s\n" +
            "- Thông số khác: %s\n" +
            "Bài viết cần hấp dẫn, chuyên nghiệp và chia thành các phần rõ ràng như Giới thiệu, Đặc điểm nổi bật. Không cần trả về thẻ ```html, chỉ trả về code html trực tiếp.",
            request.getName(), request.getBrand(), request.getSwitchType(), request.getLayout(), request.getExtraFeatures()
        );
        
        return callGroq(systemPrompt, userPrompt);
    }

    private String callGroq(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            // Tạo messages theo format OpenAI
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);
            
            Map<String, Object> requestBodyMap = new HashMap<>();
            requestBodyMap.put("model", MODEL);
            requestBodyMap.put("messages", List.of(systemMessage, userMessage));
            requestBodyMap.put("temperature", 0.7);
            requestBodyMap.put("max_tokens", 2000);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBodyMap, headers);
            
            String responseStr = restTemplate.postForObject(GROQ_API_URL, requestEntity, String.class);
            
            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode messageNode = rootNode.path("choices").get(0)
                                          .path("message")
                                          .path("content");
                                        
            String result = messageNode.asText();
            
            // Clean markdown code blocks if any
            if (result.startsWith("```html")) {
                result = result.substring(7);
            }
            if (result.startsWith("```")) {
                result = result.substring(3);
            }
            if (result.endsWith("```")) {
                result = result.substring(0, result.length() - 3);
            }
            
            return result.trim();
        } catch (Exception e) {
            log.error("Groq API Error: ", e);
            String errorMessage = "Lỗi khi gọi Groq AI: " + e.getMessage();
            if (e instanceof org.springframework.web.client.HttpStatusCodeException) {
                errorMessage += " - Response: " + ((org.springframework.web.client.HttpStatusCodeException) e).getResponseBodyAsString();
            }
            return errorMessage;
        }
    }
}
