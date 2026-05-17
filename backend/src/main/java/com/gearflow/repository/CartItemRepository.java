package com.gearflow.repository;

import com.gearflow.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.variantId = :variantId")
    void deleteByVariantId(String variantId);
    
    boolean existsByVariantId(String variantId);
}
