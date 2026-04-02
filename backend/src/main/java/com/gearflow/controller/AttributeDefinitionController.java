package com.gearflow.controller;

import com.gearflow.dto.AttributeDefinitionDTO;
import com.gearflow.service.AttributeDefinitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attribute-definitions")
@RequiredArgsConstructor
@Slf4j
public class AttributeDefinitionController {
    
    private final AttributeDefinitionService attributeDefinitionService;

    @GetMapping
    public ResponseEntity<List<AttributeDefinitionDTO>> getAllAttributeDefinitions() {
        log.info("GET /api/attribute-definitions");
        return ResponseEntity.ok(attributeDefinitionService.getAllAttributeDefinitions());
    }

    @GetMapping("/filterable")
    public ResponseEntity<List<AttributeDefinitionDTO>> getFilterableAttributes() {
        log.info("GET /api/attribute-definitions/filterable");
        return ResponseEntity.ok(attributeDefinitionService.getFilterableAttributes());
    }

    @GetMapping("/variant")
    public ResponseEntity<List<AttributeDefinitionDTO>> getVariantAttributes() {
        log.info("GET /api/attribute-definitions/variant");
        return ResponseEntity.ok(attributeDefinitionService.getVariantAttributes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttributeDefinitionDTO> getAttributeDefinition(@PathVariable String id) {
        log.info("GET /api/attribute-definitions/{}", id);
        return ResponseEntity.ok(attributeDefinitionService.getAttributeDefinition(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttributeDefinitionDTO> createAttributeDefinition(@RequestBody AttributeDefinitionDTO dto) {
        log.info("POST /api/attribute-definitions");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attributeDefinitionService.createAttributeDefinition(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttributeDefinitionDTO> updateAttributeDefinition(
            @PathVariable String id,
            @RequestBody AttributeDefinitionDTO dto) {
        log.info("PUT /api/attribute-definitions/{}", id);
        return ResponseEntity.ok(attributeDefinitionService.updateAttributeDefinition(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttributeDefinition(@PathVariable String id) {
        log.info("DELETE /api/attribute-definitions/{}", id);
        attributeDefinitionService.deleteAttributeDefinition(id);
        return ResponseEntity.noContent().build();
    }
}
