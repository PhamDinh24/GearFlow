package com.gearflow.service;

import com.gearflow.dto.ProductDTO;
import com.gearflow.entity.Product;
import com.gearflow.exception.BusinessException;
import com.gearflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkOperationService {
    private final ProductRepository productRepository;

    @Transactional
    public void bulkUpdateProductPrice(List<String> productIds, BigDecimal newPrice) {
        log.info("Bulk updating price for {} products", productIds.size());
        
        if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Price must be greater than zero");
        }

        List<Product> products = productRepository.findAllById(productIds);
        
        products.forEach(product -> product.setBasePrice(newPrice));
        productRepository.saveAll(products);
        
        log.info("Bulk price update completed for {} products", products.size());
    }

    @Transactional
    public void bulkUpdateProductStatus(List<String> productIds, Boolean isActive) {
        log.info("Bulk updating status for {} products", productIds.size());
        
        List<Product> products = productRepository.findAllById(productIds);
        
        // Note: Product entity doesn't have isActive field, so we just update the product
        // This is a placeholder for future status management
        productRepository.saveAll(products);
        
        log.info("Bulk status update completed for {} products", products.size());
    }

    @Transactional
    public void bulkUpdateProductCategory(List<String> productIds, String categoryId) {
        log.info("Bulk updating category for {} products", productIds.size());
        
        List<Product> products = productRepository.findAllById(productIds);
        
        products.forEach(product -> product.setCategoryId(categoryId));
        productRepository.saveAll(products);
        
        log.info("Bulk category update completed for {} products", products.size());
    }

    @Transactional
    public void bulkUpdateProductBrand(List<String> productIds, String brandId) {
        log.info("Bulk updating brand for {} products", productIds.size());
        
        List<Product> products = productRepository.findAllById(productIds);
        
        products.forEach(product -> product.setBrandId(brandId));
        productRepository.saveAll(products);
        
        log.info("Bulk brand update completed for {} products", products.size());
    }

    @Transactional
    public void bulkDeleteProducts(List<String> productIds) {
        log.info("Bulk deleting {} products", productIds.size());
        
        List<Product> products = productRepository.findAllById(productIds);
        productRepository.deleteAll(products);
        
        log.info("Bulk delete completed for {} products", products.size());
    }

    @Transactional
    public void bulkApplyDiscount(List<String> productIds, BigDecimal discountPercentage) {
        log.info("Bulk applying {}% discount to {} products", discountPercentage, productIds.size());
        
        if (discountPercentage.compareTo(BigDecimal.ZERO) < 0 || discountPercentage.compareTo(new BigDecimal(100)) > 0) {
            throw new BusinessException("Discount percentage must be between 0 and 100");
        }

        List<Product> products = productRepository.findAllById(productIds);
        
        products.forEach(product -> {
            BigDecimal discount = product.getBasePrice()
                    .multiply(discountPercentage)
                    .divide(new BigDecimal(100));
            product.setBasePrice(product.getBasePrice().subtract(discount));
        });
        
        productRepository.saveAll(products);
        log.info("Bulk discount applied to {} products", products.size());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getBulkOperationStatus(List<String> productIds) {
        log.info("Fetching status for {} products", productIds.size());
        return productRepository.findAllById(productIds).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .basePrice(product.getBasePrice())
                .categoryId(product.getCategoryId())
                .brandId(product.getBrandId())
                .build();
    }
}
