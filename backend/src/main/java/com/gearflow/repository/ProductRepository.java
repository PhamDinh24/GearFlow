package com.gearflow.repository;

import com.gearflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    List<Product> findByCategoryId(String categoryId);
    
    List<Product> findByBrandId(String brandId);
    
    // For recommendations
    List<Product> findByBrandIdAndIdNot(String brandId, String excludeId, Pageable pageable);
    
    List<Product> findByCategoryIdAndIdNot(String categoryId, String excludeId, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.id <> :excludeId AND p.brandId <> :excludeBrandId")
    List<Product> findByCategoryIdAndIdNotAndBrandIdNot(
        @Param("categoryId") String categoryId,
        @Param("excludeId") String excludeId,
        @Param("excludeBrandId") String excludeBrandId,
        Pageable pageable
    );
    
    @Query("SELECT p FROM Product p WHERE p.id NOT IN :excludeIds ORDER BY RANDOM()")
    List<Product> findRandomProductsExcluding(@Param("excludeIds") List<String> excludeIds, Pageable pageable);
    
    @Query("SELECT p FROM Product p ORDER BY RANDOM()")
    List<Product> findRandomProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.categoryId = :categoryId) AND " +
           "(:brandId IS NULL OR p.brandId = :brandId) AND " +
           "(:minPrice IS NULL OR p.basePrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.basePrice <= :maxPrice)")
    Page<Product> findByFilters(
        @Param("categoryId") String categoryId,
        @Param("brandId") String brandId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );
    
    // For recommendations
    @Query("SELECT p FROM Product p ORDER BY p.createdAt DESC")
    List<Product> findLatestProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.id IN " +
           "(SELECT oi.productId FROM OrderItem oi " +
           "GROUP BY oi.productId ORDER BY SUM(oi.quantity) DESC)")
    List<Product> findBestSellingProducts(Pageable pageable);
    
    // Time range queries
    @Query("SELECT p FROM Product p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    List<Product> findProductsByDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                          @Param("endDate") java.time.LocalDateTime endDate, 
                                          Pageable pageable);
}

