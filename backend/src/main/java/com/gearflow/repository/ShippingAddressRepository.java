package com.gearflow.repository;

import com.gearflow.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, String> {
    
    List<ShippingAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(String userId);
    
    Optional<ShippingAddress> findByUserIdAndIsDefaultTrue(String userId);
    
    Optional<ShippingAddress> findByIdAndUserId(String id, String userId);
    
    long countByUserId(String userId);
}
