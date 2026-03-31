package com.gearflow.controller;

import com.gearflow.dto.BrandDTO;
import com.gearflow.service.BrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/brands")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<Page<BrandDTO>> getAllBrands(Pageable pageable) {
        log.info("GET /api/admin/brands");
        Page<BrandDTO> brands = brandService.getAllBrands(pageable);
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable String id) {
        log.info("GET /api/admin/brands/{}", id);
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO dto) {
        log.info("POST /api/admin/brands - Name: {}", dto.getName());
        BrandDTO created = brandService.createBrand(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable String id, @RequestBody BrandDTO dto) {
        log.info("PUT /api/admin/brands/{}", id);
        BrandDTO updated = brandService.updateBrand(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable String id) {
        log.info("DELETE /api/admin/brands/{}", id);
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
