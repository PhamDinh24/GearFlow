package com.gearflow.repository;

import com.gearflow.entity.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductViewRepository extends JpaRepository<ProductView, String> {
    List<ProductView> findByUserIdOrderByViewedAtDesc(String userId);
    List<ProductView> findByUserIdAndViewedAtAfterOrderByViewedAtDesc(String userId, LocalDateTime date);
}
