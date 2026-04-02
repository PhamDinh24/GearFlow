package com.gearflow.service;

import com.gearflow.dto.AttributeDefinitionDTO;
import com.gearflow.entity.AttributeDefinition;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.AttributeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttributeDefinitionService {
    
    private final AttributeDefinitionRepository attributeDefinitionRepository;

    public List<AttributeDefinitionDTO> getAllAttributeDefinitions() {
        return attributeDefinitionRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AttributeDefinitionDTO> getFilterableAttributes() {
        return attributeDefinitionRepository.findByFilterableTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AttributeDefinitionDTO> getVariantAttributes() {
        return attributeDefinitionRepository.findByVariantAttributeTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AttributeDefinitionDTO getAttributeDefinition(String id) {
        AttributeDefinition definition = attributeDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute definition not found: " + id));
        return toDTO(definition);
    }

    @Transactional
    public AttributeDefinitionDTO createAttributeDefinition(AttributeDefinitionDTO dto) {
        // Check if name already exists
        if (attributeDefinitionRepository.findByName(dto.getName()).isPresent()) {
            throw new BusinessException("Attribute definition with name '" + dto.getName() + "' already exists");
        }

        AttributeDefinition definition = AttributeDefinition.builder()
                .id("attr-def-" + UUID.randomUUID().toString())
                .name(dto.getName())
                .displayName(dto.getDisplayName())
                .type(AttributeDefinition.AttributeType.valueOf(dto.getType()))
                .unit(dto.getUnit())
                .filterable(dto.getFilterable() != null ? dto.getFilterable() : false)
                .variantAttribute(dto.getVariantAttribute() != null ? dto.getVariantAttribute() : false)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .build();

        definition = attributeDefinitionRepository.save(definition);
        log.info("Created attribute definition: {}", definition.getName());
        return toDTO(definition);
    }

    @Transactional
    public AttributeDefinitionDTO updateAttributeDefinition(String id, AttributeDefinitionDTO dto) {
        AttributeDefinition definition = attributeDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute definition not found: " + id));

        // Check if new name conflicts with existing
        if (!definition.getName().equals(dto.getName())) {
            if (attributeDefinitionRepository.findByName(dto.getName()).isPresent()) {
                throw new BusinessException("Attribute definition with name '" + dto.getName() + "' already exists");
            }
        }

        definition.setName(dto.getName());
        definition.setDisplayName(dto.getDisplayName());
        definition.setType(AttributeDefinition.AttributeType.valueOf(dto.getType()));
        definition.setUnit(dto.getUnit());
        definition.setFilterable(dto.getFilterable());
        definition.setVariantAttribute(dto.getVariantAttribute());
        definition.setDisplayOrder(dto.getDisplayOrder());

        definition = attributeDefinitionRepository.save(definition);
        log.info("Updated attribute definition: {}", definition.getName());
        return toDTO(definition);
    }

    @Transactional
    public void deleteAttributeDefinition(String id) {
        if (!attributeDefinitionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attribute definition not found: " + id);
        }
        attributeDefinitionRepository.deleteById(id);
        log.info("Deleted attribute definition: {}", id);
    }

    private AttributeDefinitionDTO toDTO(AttributeDefinition definition) {
        return AttributeDefinitionDTO.builder()
                .id(definition.getId())
                .name(definition.getName())
                .displayName(definition.getDisplayName())
                .type(definition.getType().toString())
                .unit(definition.getUnit())
                .filterable(definition.getFilterable())
                .variantAttribute(definition.getVariantAttribute())
                .displayOrder(definition.getDisplayOrder())
                .createdAt(definition.getCreatedAt())
                .build();
    }
}
