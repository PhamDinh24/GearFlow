package com.keyboard.service;

import com.keyboard.dto.ProductDTO;
import com.keyboard.entity.Product;
import com.keyboard.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(ProductDTO::fromEntity);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ProductDTO.fromEntity(product);
    }

    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        Page<Product> products = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        return products.map(ProductDTO::fromEntity);
    }

    public Page<ProductDTO> filterProducts(String brand, Double minPrice, Double maxPrice, 
                                          String switchType, Pageable pageable) {
        Product.SwitchType type = null;
        if (switchType != null && !switchType.isEmpty()) {
            type = Product.SwitchType.valueOf(switchType.toUpperCase());
        }
        
        Page<Product> products = productRepository.findByFilters(brand, minPrice, maxPrice, type, pageable);
        return products.map(ProductDTO::fromEntity);
    }

    public ProductDTO createProduct(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setBrand(dto.getBrand());
        if (dto.getSwitchType() != null) {
            product.setSwitchType(Product.SwitchType.valueOf(dto.getSwitchType().toUpperCase()));
        }
        product.setLayout(dto.getLayout());
        product.setWireless(dto.getWireless());
        product.setRgb(dto.getRgb());
        product.setImageUrl(dto.getImageUrl());
        product.setCreatedAt(LocalDateTime.now());

        Product saved = productRepository.save(product);
        return ProductDTO.fromEntity(saved);
    }

    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setBrand(dto.getBrand());
        if (dto.getSwitchType() != null) {
            product.setSwitchType(Product.SwitchType.valueOf(dto.getSwitchType().toUpperCase()));
        }
        product.setLayout(dto.getLayout());
        product.setWireless(dto.getWireless());
        product.setRgb(dto.getRgb());
        product.setImageUrl(dto.getImageUrl());
        product.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return ProductDTO.fromEntity(updated);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
