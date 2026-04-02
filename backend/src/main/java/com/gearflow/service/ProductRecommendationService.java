package com.gearflow.service;

import com.gearflow.dto.ProductDTO;
import com.gearflow.entity.Product;
import com.gearflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRecommendationService {
    
    private final ProductRepository productRepository;
    private final ProductService productService;

    /**
     * Get recommended products based on current product
     * Priority: Same brand > Same category > Random
     */
    public List<ProductDTO> getRecommendedProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId).orElse(null);
        if (currentProduct == null) {
            return getRandomProducts(limit);
        }

        List<Product> recommendations = new ArrayList<>();

        // 1. Same brand products (excluding current)
        List<Product> sameBrand = productRepository.findByBrandIdAndIdNot(
                currentProduct.getBrandId(), 
                productId, 
                PageRequest.of(0, limit)
        );
        recommendations.addAll(sameBrand);

        // 2. If not enough, add same category products
        if (recommendations.size() < limit) {
            int remaining = limit - recommendations.size();
            List<Product> sameCategory = productRepository.findByCategoryIdAndIdNotAndBrandIdNot(
                    currentProduct.getCategoryId(),
                    productId,
                    currentProduct.getBrandId(),
                    PageRequest.of(0, remaining)
            );
            recommendations.addAll(sameCategory);
        }

        // 3. If still not enough, add random products
        if (recommendations.size() < limit) {
            int remaining = limit - recommendations.size();
            List<String> excludeIds = recommendations.stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());
            excludeIds.add(productId);
            
            List<Product> randomProducts = productRepository.findRandomProductsExcluding(
                    excludeIds,
                    PageRequest.of(0, remaining)
            );
            recommendations.addAll(randomProducts);
        }

        log.info("Found {} recommended products for product {}", recommendations.size(), productId);
        
        return recommendations.stream()
                .limit(limit)
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get products from same brand
     */
    public List<ProductDTO> getSameBrandProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId).orElse(null);
        if (currentProduct == null) {
            return List.of();
        }

        List<Product> products = productRepository.findByBrandIdAndIdNot(
                currentProduct.getBrandId(),
                productId,
                PageRequest.of(0, limit)
        );

        return products.stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get products from same category
     */
    public List<ProductDTO> getSameCategoryProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId).orElse(null);
        if (currentProduct == null) {
            return List.of();
        }

        List<Product> products = productRepository.findByCategoryIdAndIdNot(
                currentProduct.getCategoryId(),
                productId,
                PageRequest.of(0, limit)
        );

        return products.stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get random products
     */
    private List<ProductDTO> getRandomProducts(int limit) {
        List<Product> products = productRepository.findRandomProducts(PageRequest.of(0, limit));
        return products.stream()
                .map(productService::convertToDTO)
                .collect(Collectors.toList());
    }
}
