package com.gearflow.service;

import com.gearflow.dto.ProductVariantDTO;
import com.gearflow.entity.ProductVariant;
import com.gearflow.entity.Stock;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.ProductVariantRepository;
import com.gearflow.repository.StockRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductVariantService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private StockRepository stockRepository;

    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getVariantsByProductId(String productId) {
        return productVariantRepository.findByProductId(productId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductVariantDTO getVariantById(String variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
        return convertToDTO(variant);
    }

    @Transactional
    public ProductVariantDTO createVariant(String productId, ProductVariantDTO variantDTO) {
        String variantId = UUID.randomUUID().toString();

        ProductVariant variant = ProductVariant.builder()
            .id(variantId)
            .productId(productId)
            .switchType(variantDTO.getSwitchType())
            .color(variantDTO.getColor())
            .keycapSet(variantDTO.getKeycapSet())
            .connectionType(variantDTO.getConnectionType())
            .priceModifier(variantDTO.getPriceModifier() != null ? 
                variantDTO.getPriceModifier() : BigDecimal.ZERO)
            .build();

        ProductVariant saved = productVariantRepository.save(variant);

        // Create stock entry
        Stock stock = Stock.builder()
            .variantId(variantId)
            .quantity(0)
            .reserved(0)
            .build();
        stockRepository.save(stock);

        return convertToDTO(saved);
    }

    @Transactional
    public ProductVariantDTO updateVariant(String variantId, ProductVariantDTO variantDTO) {
        ProductVariant variant = productVariantRepository.findById(variantId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (variantDTO.getColor() != null && !variantDTO.getColor().isEmpty()) {
            variant.setColor(variantDTO.getColor());
        }
        if (variantDTO.getKeycapSet() != null && !variantDTO.getKeycapSet().isEmpty()) {
            variant.setKeycapSet(variantDTO.getKeycapSet());
        }
        if (variantDTO.getPriceModifier() != null) {
            variant.setPriceModifier(variantDTO.getPriceModifier());
        }

        ProductVariant updated = productVariantRepository.save(variant);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteVariant(String variantId) {
        productVariantRepository.deleteById(variantId);
        stockRepository.deleteById(variantId);
    }

    private ProductVariantDTO convertToDTO(ProductVariant variant) {
        Stock stock = stockRepository.findById(variant.getId()).orElse(null);
        Integer availableStock = stock != null ? stock.getAvailable() : 0;

        return ProductVariantDTO.builder()
            .id(variant.getId())
            .productId(variant.getProductId())
            .switchType(variant.getSwitchType())
            .color(variant.getColor())
            .keycapSet(variant.getKeycapSet())
            .connectionType(variant.getConnectionType())
            .priceModifier(variant.getPriceModifier())
            .availableStock(availableStock)
            .inStock(availableStock > 0)
            .build();
    }
}
