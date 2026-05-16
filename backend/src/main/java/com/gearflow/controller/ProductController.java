package com.gearflow.controller;

import com.gearflow.dto.ProductDTO;
import com.gearflow.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<ProductDTO>> getLatestProducts(
            @RequestParam(defaultValue = "6") Integer limit) {
        return ResponseEntity.ok(productService.getLatestProducts(limit));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts(
            @RequestParam(defaultValue = "6") Integer limit) {
        return ResponseEntity.ok(productService.getBestSellingProducts(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.searchProducts(keyword, pageable));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductDTO>> filterProducts(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) String layout,
            @RequestParam(required = false) String connectionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.filterProducts(brand, minPrice, maxPrice, layout, connectionType, pageable));
    }

    @GetMapping("/facets")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, List<Object>>> getFacetCounts(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice) {
        var facets = productService.getFacetCounts(brand, minPrice, maxPrice);
        return ResponseEntity.ok((Map<String, List<Object>>) (Object) facets);
    }

    // Admin Endpoints
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        log.info("POST /api/products/admin - Creating product: {}", productDTO.getName());
        ProductDTO created = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @RequestBody ProductDTO productDTO) {
        log.info("PUT /api/products/admin/{} - Updating product", id);
        ProductDTO updated = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        log.info("DELETE /api/products/admin/{} - Deleting product", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Product Variant Endpoints
    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<com.gearflow.dto.ProductVariantDTO>> getProductVariants(@PathVariable String productId) {
        return ResponseEntity.ok(productService.getVariantsByProductId(productId));
    }

    @PostMapping("/{productId}/variants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.ProductVariantDTO> createVariant(
            @PathVariable String productId,
            @RequestBody com.gearflow.dto.ProductVariantDTO variantDTO) {
        return ResponseEntity.ok(productService.createVariant(productId, variantDTO));
    }

    @PutMapping("/admin/variants/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.ProductVariantDTO> updateVariant(
            @PathVariable String variantId,
            @RequestBody com.gearflow.dto.ProductVariantDTO variantDTO) {
        return ResponseEntity.ok(productService.updateVariant(variantId, variantDTO));
    }

    @DeleteMapping("/admin/variants/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVariant(@PathVariable String variantId) {
        productService.deleteVariant(variantId);
        return ResponseEntity.noContent().build();
    }

    // Stock Management Endpoints
    @GetMapping("/admin/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<com.gearflow.dto.StockDTO>> getAllStock(Pageable pageable) {
        return ResponseEntity.ok(productService.getAllStock(pageable));
    }

    @PutMapping("/admin/stock/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.StockDTO> updateStock(
            @PathVariable String variantId,
            @RequestBody java.util.Map<String, Integer> body) {
        Integer quantity = body.get("stock");
        if (quantity == null) quantity = body.get("quantity");
        if (quantity == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(productService.updateStock(variantId, quantity));
    }

    @PostMapping("/admin/stock/{variantId}/reserve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reserveStock(
            @PathVariable String variantId,
            @RequestParam Integer amount) {
        productService.reserveStock(variantId, amount);
        return ResponseEntity.ok().build();
    }

    // Brand Endpoints
    @GetMapping("/brands")
    public ResponseEntity<List<com.gearflow.dto.BrandDTO>> getAllBrandsPublic() {
        return ResponseEntity.ok(productService.getAllBrands());
    }

    @GetMapping("/admin/brands")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<com.gearflow.dto.BrandDTO>> getAllBrandsPaged(Pageable pageable) {
        return ResponseEntity.ok(productService.getAllBrands(pageable));
    }

    @PostMapping("/admin/brands")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.BrandDTO> createBrand(@RequestBody com.gearflow.dto.BrandDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createBrand(dto));
    }

    @PutMapping("/admin/brands/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.BrandDTO> updateBrand(@PathVariable String id, @RequestBody com.gearflow.dto.BrandDTO dto) {
        return ResponseEntity.ok(productService.updateBrand(id, dto));
    }

    @DeleteMapping("/admin/brands/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrand(@PathVariable String id) {
        productService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    // Category Endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<com.gearflow.dto.CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.CategoryDTO> createCategory(@RequestBody com.gearflow.dto.CategoryDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createCategory(dto));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.CategoryDTO> updateCategory(@PathVariable String id, @RequestBody com.gearflow.dto.CategoryDTO dto) {
        return ResponseEntity.ok(productService.updateCategory(id, dto));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        productService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // Attribute Definition Endpoints
    @GetMapping("/attribute-definitions")
    public ResponseEntity<List<com.gearflow.dto.AttributeDefinitionDTO>> getAllAttributeDefinitions() {
        return ResponseEntity.ok(productService.getAllAttributeDefinitions());
    }

    @GetMapping("/attribute-definitions/filterable")
    public ResponseEntity<List<com.gearflow.dto.AttributeDefinitionDTO>> getFilterableAttributes() {
        return ResponseEntity.ok(productService.getFilterableAttributes());
    }

    @GetMapping("/attribute-definitions/variant")
    public ResponseEntity<List<com.gearflow.dto.AttributeDefinitionDTO>> getVariantAttributes() {
        return ResponseEntity.ok(productService.getVariantAttributes());
    }

    @GetMapping("/attribute-definitions/{id}")
    public ResponseEntity<com.gearflow.dto.AttributeDefinitionDTO> getAttributeDefinition(@PathVariable String id) {
        return ResponseEntity.ok(productService.getAttributeDefinition(id));
    }

    @PostMapping("/attribute-definitions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.AttributeDefinitionDTO> createAttributeDefinition(@RequestBody com.gearflow.dto.AttributeDefinitionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createAttributeDefinition(dto));
    }

    @PutMapping("/attribute-definitions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.gearflow.dto.AttributeDefinitionDTO> updateAttributeDefinition(
            @PathVariable String id,
            @RequestBody com.gearflow.dto.AttributeDefinitionDTO dto) {
        return ResponseEntity.ok(productService.updateAttributeDefinition(id, dto));
    }

    @DeleteMapping("/attribute-definitions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttributeDefinition(@PathVariable String id) {
        productService.deleteAttributeDefinition(id);
        return ResponseEntity.noContent().build();
    }

    // Recommendation Endpoints
    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductDTO>> getRelatedProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(productService.getRelatedProducts(id, limit));
    }



    @GetMapping("/by-date-range")
    public ResponseEntity<List<ProductDTO>> getProductsByDateRange(
            @RequestParam java.time.LocalDateTime startDate,
            @RequestParam java.time.LocalDateTime endDate,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(productService.getProductsByDateRange(startDate, endDate, limit));
    }

    @GetMapping("/public/stats")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        return ResponseEntity.ok(productService.getPublicStats());
    }
}
