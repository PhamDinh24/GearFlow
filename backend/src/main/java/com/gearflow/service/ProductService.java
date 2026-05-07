package com.gearflow.service;

import com.gearflow.dto.FacetCountDTO;
import com.gearflow.dto.ProductDTO;
import com.gearflow.dto.ProductVariantDTO;
import com.gearflow.dto.ProductAttributeDTO;
import com.gearflow.entity.Brand;
import com.gearflow.entity.Category;
import com.gearflow.entity.Product;
import com.gearflow.entity.ProductVariant;
import com.gearflow.entity.ProductAttribute;
import com.gearflow.entity.Stock;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.ProductRepository;
import com.gearflow.repository.ProductVariantRepository;
import com.gearflow.repository.ProductAttributeRepository;
import com.gearflow.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductAttributeRepository productAttributeRepository;
    private final StockRepository stockRepository;
    private final com.gearflow.repository.BrandRepository brandRepository;
    private final com.gearflow.repository.CategoryRepository categoryRepository;
    private final com.gearflow.repository.AttributeDefinitionRepository attributeDefinitionRepository;

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
    @CacheEvict(value = {"products", "product", "products_search", "products_filter", "facets"}, allEntries = true)
    public ProductDTO createProduct(ProductDTO dto) {
        log.info("Creating new product: {}", dto.getName());

        // Validate required fields
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (dto.getBasePrice() == null || dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Product base price must be greater than zero");
        }
        if (dto.getCategoryId() == null || dto.getCategoryId().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (dto.getBrandId() == null || dto.getBrandId().trim().isEmpty()) {
            throw new IllegalArgumentException("Brand is required");
        }

        Product product = buildProductFromDTO(dto);
        product.setId(java.util.UUID.randomUUID().toString());

        Product saved = productRepository.save(product);
        log.info("Product created with id: {}", saved.getId());
        return convertToDTO(saved);
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "products_search", "products_filter", "facets"}, allEntries = true)
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
    @CacheEvict(value = {"products", "product", "products_search", "products_filter", "facets"}, allEntries = true)
    public void deleteProduct(String id) {
        log.info("Deleting product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        productRepository.delete(product);
        log.info("Product deleted with id: {}", id);
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "products_search", "products_filter", "facets"}, allEntries = true)
    public void updateProductImage(String productId, String imageUrl) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        product.setImageUrl(imageUrl);
        productRepository.save(product);
        log.info("Product image updated for product: {}", productId);
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
        // Load variants with stock
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        List<ProductVariantDTO> variantDTOs = variants.stream()
                .map(v -> convertVariantToDTO(v, product.getBasePrice()))
                .collect(Collectors.toList());

        // Load attributes
        List<ProductAttribute> attributes = productAttributeRepository.findByProductId(product.getId());
        List<ProductAttributeDTO> attributeDTOs = attributes.stream()
                .map(this::convertAttributeToDTO)
                .collect(Collectors.toList());

        // Calculate total stock from all variants
        int totalStock = variants.stream()
                .mapToInt(v -> {
                    Stock stock = stockRepository.findById(v.getId()).orElse(null);
                    return stock != null ? stock.getAvailable() : 0;
                })
                .sum();

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
                .variants(variantDTOs)
                .attributes(attributeDTOs)
                .stock(totalStock)
                .build();
    }

    private ProductVariantDTO convertVariantToDTO(ProductVariant variant, BigDecimal basePrice) {
        // Get stock for this variant
        Stock stock = stockRepository.findById(variant.getId()).orElse(null);
        int stockQuantity = stock != null ? stock.getQuantity() : 0;
        int availableStock = stock != null ? stock.getAvailable() : 0;

        BigDecimal priceModifier = variant.getPriceModifier() != null ? variant.getPriceModifier() : BigDecimal.ZERO;
        BigDecimal finalPrice = basePrice.add(priceModifier);

        return ProductVariantDTO.builder()
                .id(variant.getId())
                .productId(variant.getProductId())
                .switchType(variant.getSwitchType())
                .color(variant.getColor())
                .keycapSet(variant.getKeycapSet())
                .connectionType(variant.getConnectionType())
                .priceModifier(priceModifier)
                .finalPrice(finalPrice)
                .availableStock(availableStock)
                .stock(stockQuantity)
                .inStock(availableStock > 0)
                .build();
    }

    private ProductAttributeDTO convertAttributeToDTO(ProductAttribute attribute) {
        return ProductAttributeDTO.builder()
                .id(attribute.getId())
                .productId(attribute.getProductId())
                .name(attribute.getName())
                .value(attribute.getValue())
                .build();
    }
    
    // Recommendation methods
    @Cacheable(value = "related_products", key = "#productId + '-' + #limit")
    public List<ProductDTO> getRelatedProducts(String productId, int limit) {
        log.info("Getting related products for product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        List<Product> related = productRepository.findByCategoryIdAndIdNot(
            product.getCategoryId(), 
            productId, 
            PageRequest.of(0, limit)
        );
        
        if (related.size() < limit) {
            // If not enough from same category, add from same brand but different category
            List<Product> brandRelated = productRepository.findByBrandIdAndIdNot(
                product.getBrandId(), 
                productId, 
                PageRequest.of(0, limit - related.size())
            );
            related.addAll(brandRelated.stream()
                .filter(p -> !related.stream().anyMatch(r -> r.getId().equals(p.getId())))
                .collect(Collectors.toList()));
        }
        
        return related.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Cacheable(value = "latest_products", key = "#limit")
    public List<ProductDTO> getLatestProducts(int limit) {
        log.info("Getting latest products, limit: {}", limit);
        List<Product> latest = productRepository.findLatestProducts(PageRequest.of(0, limit));
        return latest.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Cacheable(value = "best_selling_products", key = "#limit")
    public List<ProductDTO> getBestSellingProducts(int limit) {
        log.info("Getting best selling products, limit: {}", limit);
        List<Product> bestSelling = productRepository.findBestSellingProducts(PageRequest.of(0, limit));
        return bestSelling.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Cacheable(value = "products_by_date", key = "#startDate + '-' + #endDate")
    public List<ProductDTO> getProductsByDateRange(java.time.LocalDateTime startDate, 
                                                    java.time.LocalDateTime endDate, 
                                                    int limit) {
        log.info("Getting products between {} and {}", startDate, endDate);
        List<Product> products = productRepository.findProductsByDateRange(
            startDate, 
            endDate, 
            PageRequest.of(0, limit)
        );
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // --- Variant Management Methods ---
    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getVariantsByProductId(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productVariantRepository.findByProductId(productId).stream()
                .map(v -> convertVariantToDTO(v, product.getBasePrice())).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductVariantDTO getVariantById(String variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
        Product product = productRepository.findById(variant.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return convertVariantToDTO(variant, product.getBasePrice());
    }

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductVariantDTO createVariant(String productId, ProductVariantDTO variantDTO) {
        // Get product to retrieve basePrice
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        String variantId = java.util.UUID.randomUUID().toString();
        ProductVariant variant = ProductVariant.builder()
                .id(variantId).productId(productId)
                .switchType(variantDTO.getSwitchType()).color(variantDTO.getColor())
                .keycapSet(variantDTO.getKeycapSet()).connectionType(variantDTO.getConnectionType())
                .priceModifier(variantDTO.getPriceModifier() != null ? variantDTO.getPriceModifier() : BigDecimal.ZERO)
                .build();
        ProductVariant saved = productVariantRepository.save(variant);
        stockRepository.save(Stock.builder().variantId(variantId).quantity(0).reserved(0).build());
        return convertVariantToDTO(saved, product.getBasePrice());
    }

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductVariantDTO updateVariant(String variantId, ProductVariantDTO variantDTO) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
        
        // Get product to retrieve basePrice
        Product product = productRepository.findById(variant.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Update all variant fields if provided
        if (variantDTO.getSwitchType() != null) variant.setSwitchType(variantDTO.getSwitchType());
        if (variantDTO.getColor() != null) variant.setColor(variantDTO.getColor());
        if (variantDTO.getKeycapSet() != null) variant.setKeycapSet(variantDTO.getKeycapSet());
        if (variantDTO.getConnectionType() != null) variant.setConnectionType(variantDTO.getConnectionType());
        if (variantDTO.getPriceModifier() != null) variant.setPriceModifier(variantDTO.getPriceModifier());
        
        productVariantRepository.save(variant);
        
        // Update stock if provided
        if (variantDTO.getStock() != null && variantDTO.getStock() >= 0) {
            Stock stock = stockRepository.findById(variantId)
                    .orElse(Stock.builder().variantId(variantId).quantity(0).reserved(0).build());
            stock.setQuantity(variantDTO.getStock());
            stockRepository.save(stock);
        }
        
        return convertVariantToDTO(variant, product.getBasePrice());
    }

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void deleteVariant(String variantId) {
        productVariantRepository.deleteById(variantId);
        stockRepository.deleteById(variantId);
    }

    // --- Stock Management Methods ---
    @Transactional(readOnly = true)
    public Page<com.gearflow.dto.StockDTO> getAllStock(Pageable pageable) {
        return stockRepository.findAll(pageable).map(this::convertToStockDTO);
    }

    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public com.gearflow.dto.StockDTO updateStock(String variantId, Integer quantity) {
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        if (quantity < 0) throw new com.gearflow.exception.BusinessException("Stock quantity cannot be negative");
        stock.setQuantity(quantity);
        return convertToStockDTO(stockRepository.save(stock));
    }

    @Transactional
    public void reserveStock(String variantId, Integer amount) {
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        if (!stock.canReserve(amount)) throw new com.gearflow.exception.BusinessException("Insufficient stock");
        stock.setReserved(stock.getReserved() + amount);
        stockRepository.save(stock);
    }

    @Transactional
    public void releaseReservedStock(String variantId, Integer amount) {
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        stock.setReserved(Math.max(0, stock.getReserved() - amount));
        stockRepository.save(stock);
    }

    @Transactional(readOnly = true)
    public boolean canReserve(String variantId, Integer amount) {
        Stock stock = stockRepository.findById(variantId).orElse(null);
        return stock != null && stock.canReserve(amount);
    }

    @Transactional
    public void incrementStock(String variantId, Integer amount) {
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        stock.setQuantity(stock.getQuantity() + amount);
        stockRepository.save(stock);
    }

    @Transactional
    public void decrementStock(String variantId, Integer amount) {
        Stock stock = stockRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found for variant: " + variantId));
        if (stock.getAvailable() < amount) throw new com.gearflow.exception.BusinessException("Insufficient stock");
        stock.setQuantity(stock.getQuantity() - amount);
        stockRepository.save(stock);
    }

    private com.gearflow.dto.StockDTO convertToStockDTO(Stock stock) {
        return com.gearflow.dto.StockDTO.builder()
                .variantId(stock.getVariantId()).quantity(stock.getQuantity())
                .reserved(stock.getReserved()).available(stock.getAvailable())
                .updatedAt(stock.getUpdatedAt()).build();
    }

    // --- Brand Management Methods ---
    @Transactional(readOnly = true)
    public List<com.gearflow.dto.BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream().map(this::convertBrandToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<com.gearflow.dto.BrandDTO> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable).map(this::convertBrandToDTO);
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "facets"}, allEntries = true)
    public com.gearflow.dto.BrandDTO createBrand(com.gearflow.dto.BrandDTO dto) {
        com.gearflow.entity.Brand brand = com.gearflow.entity.Brand.builder()
                .id(java.util.UUID.randomUUID().toString()).name(dto.getName()).description(dto.getDescription()).build();
        return convertBrandToDTO(brandRepository.save(brand));
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "facets"}, allEntries = true)
    public com.gearflow.dto.BrandDTO updateBrand(String id, com.gearflow.dto.BrandDTO dto) {
        com.gearflow.entity.Brand brand = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        if (dto.getName() != null) brand.setName(dto.getName());
        if (dto.getDescription() != null) brand.setDescription(dto.getDescription());
        return convertBrandToDTO(brandRepository.save(brand));
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "facets"}, allEntries = true)
    public void deleteBrand(String id) {
        brandRepository.deleteById(id);
    }

    private com.gearflow.dto.BrandDTO convertBrandToDTO(com.gearflow.entity.Brand brand) {
        return com.gearflow.dto.BrandDTO.builder().id(brand.getId()).name(brand.getName()).description(brand.getDescription()).createdAt(brand.getCreatedAt()).build();
    }

    // --- Category Management Methods ---
    @Transactional(readOnly = true)
    public List<com.gearflow.dto.CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::convertCategoryToDTO).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "facets"}, allEntries = true)
    public com.gearflow.dto.CategoryDTO createCategory(com.gearflow.dto.CategoryDTO dto) {
        com.gearflow.entity.Category category = com.gearflow.entity.Category.builder()
                .id(java.util.UUID.randomUUID().toString()).name(dto.getName()).description(dto.getDescription()).build();
        return convertCategoryToDTO(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "facets"}, allEntries = true)
    public com.gearflow.dto.CategoryDTO updateCategory(String id, com.gearflow.dto.CategoryDTO dto) {
        com.gearflow.entity.Category category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return convertCategoryToDTO(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = {"products", "product", "facets"}, allEntries = true)
    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }

    private com.gearflow.dto.CategoryDTO convertCategoryToDTO(com.gearflow.entity.Category category) {
        return com.gearflow.dto.CategoryDTO.builder().id(category.getId()).name(category.getName()).description(category.getDescription()).createdAt(category.getCreatedAt()).build();
    }

    // --- Attribute Definition Management ---
    @Transactional(readOnly = true)
    public List<com.gearflow.dto.AttributeDefinitionDTO> getAllAttributeDefinitions() {
        return attributeDefinitionRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toAttributeDefinitionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.gearflow.dto.AttributeDefinitionDTO> getFilterableAttributes() {
        return attributeDefinitionRepository.findByFilterableTrue().stream().map(this::toAttributeDefinitionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.gearflow.dto.AttributeDefinitionDTO> getVariantAttributes() {
        return attributeDefinitionRepository.findByVariantAttributeTrue().stream().map(this::toAttributeDefinitionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.gearflow.dto.AttributeDefinitionDTO getAttributeDefinition(String id) {
        com.gearflow.entity.AttributeDefinition definition = attributeDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute definition not found: " + id));
        return toAttributeDefinitionDTO(definition);
    }

    @Transactional
    @CacheEvict(value = {"products", "facets"}, allEntries = true)
    public com.gearflow.dto.AttributeDefinitionDTO createAttributeDefinition(com.gearflow.dto.AttributeDefinitionDTO dto) {
        if (attributeDefinitionRepository.findByName(dto.getName()).isPresent()) {
            throw new com.gearflow.exception.BusinessException("Attribute definition with name '" + dto.getName() + "' already exists");
        }
        com.gearflow.entity.AttributeDefinition definition = com.gearflow.entity.AttributeDefinition.builder()
                .id("attr-def-" + java.util.UUID.randomUUID().toString())
                .name(dto.getName()).displayName(dto.getDisplayName())
                .type(com.gearflow.entity.AttributeDefinition.AttributeType.valueOf(dto.getType()))
                .unit(dto.getUnit()).filterable(dto.getFilterable() != null ? dto.getFilterable() : false)
                .variantAttribute(dto.getVariantAttribute() != null ? dto.getVariantAttribute() : false)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0).build();
        return toAttributeDefinitionDTO(attributeDefinitionRepository.save(definition));
    }

    @Transactional
    @CacheEvict(value = {"products", "facets"}, allEntries = true)
    public com.gearflow.dto.AttributeDefinitionDTO updateAttributeDefinition(String id, com.gearflow.dto.AttributeDefinitionDTO dto) {
        com.gearflow.entity.AttributeDefinition definition = attributeDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute definition not found: " + id));
        definition.setName(dto.getName());
        definition.setDisplayName(dto.getDisplayName());
        definition.setType(com.gearflow.entity.AttributeDefinition.AttributeType.valueOf(dto.getType()));
        definition.setUnit(dto.getUnit());
        definition.setFilterable(dto.getFilterable());
        definition.setVariantAttribute(dto.getVariantAttribute());
        definition.setDisplayOrder(dto.getDisplayOrder());
        return toAttributeDefinitionDTO(attributeDefinitionRepository.save(definition));
    }

    @Transactional
    @CacheEvict(value = {"products", "facets"}, allEntries = true)
    public void deleteAttributeDefinition(String id) {
        attributeDefinitionRepository.deleteById(id);
    }

    private com.gearflow.dto.AttributeDefinitionDTO toAttributeDefinitionDTO(com.gearflow.entity.AttributeDefinition definition) {
        return com.gearflow.dto.AttributeDefinitionDTO.builder()
                .id(definition.getId()).name(definition.getName()).displayName(definition.getDisplayName())
                .type(definition.getType().toString()).unit(definition.getUnit())
                .filterable(definition.getFilterable()).variantAttribute(definition.getVariantAttribute())
                .displayOrder(definition.getDisplayOrder()).createdAt(definition.getCreatedAt()).build();
    }
}
