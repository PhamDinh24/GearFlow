package com.gearflow.controller;

import com.gearflow.dto.BrandDTO;
import com.gearflow.service.BrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
@Slf4j
public class PublicBrandController {
    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        log.info("GET /api/brands");
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable String id) {
        log.info("GET /api/brands/{}", id);
        return ResponseEntity.ok(brandService.getBrandById(id));
    }
}
