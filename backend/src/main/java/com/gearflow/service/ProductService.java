package com.gearflow.service;

import com.gearflow.dto.FacetCountDTO;
import com.gearflow.dto.ProductDTO;
import com.gearflow.entity.Brand;
import com.gearflow.entity.Category;
import com.gearflow.entity.Product;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        log.info("Fetching all products with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Cacheable(value = "product", key = "#id")
    public ProductDTO getProductById(String id) {
        log.info("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDTO(product);
    }

    @Cacheable(value = "products_search", key = "#keyword + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        log.info("Searching products with keyword: {}", keyword);
        return productRepository.findByNameContainingIgnoreCase(keyword, pageable).map(this::convertToDTO);
    }

    @Cacheable(value = "products_filter", key = "#brand + '-' + #minPrice + '-' + #maxPrice + '-' + #pageable.pageNumber")
    public Page<ProductDTO> filterProducts(String brand, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.info("Filtering products: brand={}, minPrice={}, maxPrice={}", 
                brand, minPrice, maxPrice);

        return productRepository.findByFilters(brand, brand, minPrice, maxPrice, pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(value = "facets", key = "#brand + '-' + #minPrice + '-' + #maxPrice")
    public Map<String, List<FacetCountDTO>> getFacetCounts(String brand, BigDecimal minPrice, BigDecimal maxPrice) {
        log.info("Calculating facet counts");
        Map<String, List<FacetCountDTO>> facets = new HashMap<>();
        return facets;
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        log.info("Creating new product: {}", dto.getName());

        Product product = buildProductFromDTO(dto);
        product.setId(java.util.UUID.randomUUID().toString());

        Product saved = productRepository.save(product);
        log.info("Product created with id: {}", saved.getId());
        return convertToDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(String id, ProductDTO dto) {
        log.info("Updating product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        updateProductFromDTO(product, dto);

        Product updated = productRepository.save(product);
        log.info("Product updated with id: {}", id);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteProduct(String id) {
        log.info("Deleting product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        productRepository.delete(product);
        log.info("Product deleted with id: {}", id);
    }

    private Product buildProductFromDTO(ProductDTO dto) {
        return Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .basePrice(dto.getBasePrice())
                .categoryId(dto.getCategoryId())
                .brandId(dto.getBrandId())
                .support(dto.getSupport())
                .imageUrl(dto.getImageUrl())
                .build();
    }

    private void updateProductFromDTO(Product product, ProductDTO dto) {
        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getBasePrice() != null) product.setBasePrice(dto.getBasePrice());
        if (dto.getCategoryId() != null) product.setCategoryId(dto.getCategoryId());
        if (dto.getBrandId() != null) product.setBrandId(dto.getBrandId());
        if (dto.getSupport() != null) product.setSupport(dto.getSupport());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());
    }

    public ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategoryId())
                .brandId(product.getBrandId())
                .support(product.getSupport())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
