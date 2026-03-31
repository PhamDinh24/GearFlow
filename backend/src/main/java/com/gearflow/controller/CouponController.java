package com.gearflow.controller;

import com.gearflow.dto.CouponDTO;
import com.gearflow.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
@Slf4j
public class CouponController {
    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CouponDTO>> getAllCoupons(Pageable pageable) {
        log.info("GET /api/admin/coupons");
        return ResponseEntity.ok(couponService.getAllCoupons(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> getCouponById(@PathVariable String id) {
        log.info("GET /api/admin/coupons/{}", id);
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponDTO> validateCoupon(@RequestParam String code, @RequestParam BigDecimal orderAmount) {
        log.info("POST /api/admin/coupons/validate - Code: {}", code);
        return ResponseEntity.ok(couponService.validateCoupon(code, orderAmount));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO dto) {
        log.info("POST /api/admin/coupons - Code: {}", dto.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.createCoupon(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> updateCoupon(@PathVariable String id, @RequestBody CouponDTO dto) {
        log.info("PUT /api/admin/coupons/{}", id);
        return ResponseEntity.ok(couponService.updateCoupon(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable String id) {
        log.info("DELETE /api/admin/coupons/{}", id);
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}
