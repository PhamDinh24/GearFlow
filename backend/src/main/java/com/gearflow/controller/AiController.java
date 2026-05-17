package com.gearflow.controller;

import com.gearflow.dto.AiChatRequest;
import com.gearflow.dto.AiChatResponse;
import com.gearflow.dto.AiDescriptionRequest;
import com.gearflow.dto.AiResponse;
import com.gearflow.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Hoặc cấu hình cho phù hợp với app
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        AiChatResponse reply = aiService.getChatResponseWithSuggestions(request.getMessage());
        return ResponseEntity.ok(reply);
    }

    @PostMapping("/admin/generate-description")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AiResponse> generateDescription(@RequestBody AiDescriptionRequest request) {
        String description = aiService.generateProductDescription(request);
        return ResponseEntity.ok(new AiResponse(description));
    }
}
