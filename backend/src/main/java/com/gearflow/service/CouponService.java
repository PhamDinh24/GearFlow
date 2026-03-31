package com.gearflow.service;

import com.gearflow.dto.CouponDTO;
import com.gearflow.entity.Coupon;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {
    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public Page<CouponDTO> getAllCoupons(Pageable pageable) {
        log.info("Fetching all coupons");
        return couponRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public CouponDTO getCouponById(String id) {
        log.info("Fetching coupon with id: {}", id);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        return convertToDTO(coupon);
    }

    @Transactional(readOnly = true)
    public CouponDTO validateCoupon(String code, BigDecimal orderAmount) {
        log.info("Validating coupon code: {}", code);
        
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + code));

        if (!coupon.getIsActive()) {
            throw new BusinessException("Coupon is not active");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Coupon has expired");
        }

        if (coupon.getMaxUsageCount() != null && coupon.getCurrentUsageCount() >= coupon.getMaxUsageCount()) {
            throw new BusinessException("Coupon usage limit exceeded");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException("Order amount is below minimum required for this coupon");
        }

        return convertToDTO(coupon);
    }

    @Transactional
    public CouponDTO createCoupon(CouponDTO dto) {
        log.info("Creating new coupon with code: {}", dto.getCode());
        
        if (couponRepository.findByCode(dto.getCode()).isPresent()) {
            throw new BusinessException("Coupon with code '" + dto.getCode() + "' already exists");
        }

        Coupon coupon = Coupon.builder()
                .id(UUID.randomUUID().toString())
                .code(dto.getCode())
                .description(dto.getDescription())
                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(dto.getDiscountPercentage())
                .minOrderAmount(dto.getMinOrderAmount())
                .maxUsageCount(dto.getMaxUsageCount())
                .expiryDate(dto.getExpiryDate())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        Coupon saved = couponRepository.save(coupon);
        log.info("Coupon created with id: {}", saved.getId());
        return convertToDTO(saved);
    }

    @Transactional
    public CouponDTO updateCoupon(String id, CouponDTO dto) {
        log.info("Updating coupon with id: {}", id);
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        if (dto.getCode() != null && !dto.getCode().equals(coupon.getCode())) {
            if (couponRepository.findByCode(dto.getCode()).isPresent()) {
                throw new BusinessException("Coupon with code '" + dto.getCode() + "' already exists");
            }
            coupon.setCode(dto.getCode());
        }

        if (dto.getDescription() != null) {
            coupon.setDescription(dto.getDescription());
        }
        if (dto.getDiscountAmount() != null) {
            coupon.setDiscountAmount(dto.getDiscountAmount());
        }
        if (dto.getDiscountPercentage() != null) {
            coupon.setDiscountPercentage(dto.getDiscountPercentage());
        }
        if (dto.getMinOrderAmount() != null) {
            coupon.setMinOrderAmount(dto.getMinOrderAmount());
        }
        if (dto.getMaxUsageCount() != null) {
            coupon.setMaxUsageCount(dto.getMaxUsageCount());
        }
        if (dto.getExpiryDate() != null) {
            coupon.setExpiryDate(dto.getExpiryDate());
        }
        if (dto.getIsActive() != null) {
            coupon.setIsActive(dto.getIsActive());
        }

        Coupon updated = couponRepository.save(coupon);
        log.info("Coupon updated with id: {}", updated.getId());
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteCoupon(String id) {
        log.info("Deleting coupon with id: {}", id);
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        couponRepository.delete(coupon);
        log.info("Coupon deleted with id: {}", id);
    }

    @Transactional
    public void incrementCouponUsage(String couponId) {
        log.info("Incrementing usage count for coupon: {}", couponId);
        
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + couponId));

        coupon.setCurrentUsageCount(coupon.getCurrentUsageCount() + 1);
        couponRepository.save(coupon);
    }

    private CouponDTO convertToDTO(Coupon coupon) {
        return CouponDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountAmount(coupon.getDiscountAmount())
                .discountPercentage(coupon.getDiscountPercentage())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxUsageCount(coupon.getMaxUsageCount())
                .currentUsageCount(coupon.getCurrentUsageCount())
                .expiryDate(coupon.getExpiryDate())
                .isActive(coupon.getIsActive())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
