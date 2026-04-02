package com.gearflow.service;

import com.gearflow.dto.BrandDTO;
import com.gearflow.entity.Brand;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandService {
    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BrandDTO> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public BrandDTO getBrandById(String id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + id));
        return convertToDTO(brand);
    }

    @Transactional
    public BrandDTO createBrand(BrandDTO dto) {
        Brand brand = Brand.builder()
                .id(UUID.randomUUID().toString())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        Brand saved = brandRepository.save(brand);
        return convertToDTO(saved);
    }

    @Transactional
    public BrandDTO updateBrand(String id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + id));
        
        if (dto.getName() != null) {
            brand.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            brand.setDescription(dto.getDescription());
        }
        
        Brand updated = brandRepository.save(brand);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteBrand(String id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand not found: " + id);
        }
        brandRepository.deleteById(id);
    }

    private BrandDTO convertToDTO(Brand brand) {
        return BrandDTO.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .createdAt(brand.getCreatedAt())
                .build();
    }
}
