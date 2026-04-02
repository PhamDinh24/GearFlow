package com.gearflow.repository;

import com.gearflow.entity.AttributeDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttributeDefinitionRepository extends JpaRepository<AttributeDefinition, String> {
    
    Optional<AttributeDefinition> findByName(String name);
    
    List<AttributeDefinition> findByFilterableTrue();
    
    List<AttributeDefinition> findByVariantAttributeTrue();
    
    List<AttributeDefinition> findAllByOrderByDisplayOrderAsc();
}
