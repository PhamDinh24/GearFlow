package com.gearflow.service;

import com.gearflow.dto.ShippingAddressDTO;
import com.gearflow.entity.ShippingAddress;
import com.gearflow.exception.BusinessException;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.ShippingAddressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingAddressService {
    
    private final ShippingAddressRepository addressRepository;
    
    @Transactional(readOnly = true)
    public List<ShippingAddressDTO> getUserAddresses(String userId) {
        log.info("Fetching addresses for user: {}", userId);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ShippingAddressDTO getDefaultAddress(String userId) {
        log.info("Fetching default address for user: {}", userId);
        return addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .map(this::toDTO)
                .orElse(null);
    }
    
    @Transactional(readOnly = true)
    public ShippingAddressDTO getAddressById(String userId, String addressId) {
        log.info("Fetching address: {} for user: {}", addressId, userId);
        return addressRepository.findByIdAndUserId(addressId, userId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
    }
    
    @Transactional
    public ShippingAddressDTO createAddress(String userId, ShippingAddressDTO dto) {
        log.info("Creating new address for user: {}", userId);
        
        // Validate
        validateAddress(dto);
        
        // If this is the first address or marked as default, set it as default
        long addressCount = addressRepository.countByUserId(userId);
        boolean shouldBeDefault = addressCount == 0 || Boolean.TRUE.equals(dto.getIsDefault());
        
        // If setting as default, unset other defaults
        if (shouldBeDefault) {
            unsetDefaultAddress(userId);
        }
        
        ShippingAddress address = ShippingAddress.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .ward(dto.getWard())
                .district(dto.getDistrict())
                .city(dto.getCity())
                .postalCode(dto.getPostalCode())
                .isDefault(shouldBeDefault)
                .build();
        
        address = addressRepository.save(address);
        log.info("Address created successfully: {}", address.getId());
        return toDTO(address);
    }
    
    @Transactional
    public ShippingAddressDTO updateAddress(String userId, String addressId, ShippingAddressDTO dto) {
        log.info("Updating address: {} for user: {}", addressId, userId);
        
        ShippingAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        // Validate
        validateAddress(dto);
        
        // If setting as default, unset other defaults
        if (Boolean.TRUE.equals(dto.getIsDefault()) && !address.getIsDefault()) {
            unsetDefaultAddress(userId);
        }
        
        // Update fields
        address.setFullName(dto.getFullName());
        address.setPhone(dto.getPhone());
        address.setEmail(dto.getEmail());
        address.setAddress(dto.getAddress());
        address.setWard(dto.getWard());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        address.setPostalCode(dto.getPostalCode());
        address.setIsDefault(dto.getIsDefault());
        
        address = addressRepository.save(address);
        log.info("Address updated successfully");
        return toDTO(address);
    }
    
    @Transactional
    public void deleteAddress(String userId, String addressId) {
        log.info("Deleting address: {} for user: {}", addressId, userId);
        
        ShippingAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);
        
        // If deleted address was default, set another as default
        if (wasDefault) {
            List<ShippingAddress> remainingAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remainingAddresses.isEmpty()) {
                ShippingAddress newDefault = remainingAddresses.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
        
        log.info("Address deleted successfully");
    }
    
    @Transactional
    public ShippingAddressDTO setDefaultAddress(String userId, String addressId) {
        log.info("Setting default address: {} for user: {}", addressId, userId);
        
        ShippingAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        // Unset other defaults
        unsetDefaultAddress(userId);
        
        // Set this as default
        address.setIsDefault(true);
        address = addressRepository.save(address);
        
        log.info("Default address set successfully");
        return toDTO(address);
    }
    
    private void unsetDefaultAddress(String userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(defaultAddress -> {
            defaultAddress.setIsDefault(false);
            addressRepository.save(defaultAddress);
        });
    }
    
    private void validateAddress(ShippingAddressDTO dto) {
        if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
            throw new BusinessException("Full name is required");
        }
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            throw new BusinessException("Phone is required");
        }
        if (dto.getAddress() == null || dto.getAddress().trim().isEmpty()) {
            throw new BusinessException("Address is required");
        }
        if (dto.getWard() == null || dto.getWard().trim().isEmpty()) {
            throw new BusinessException("Ward is required");
        }
        if (dto.getDistrict() == null || dto.getDistrict().trim().isEmpty()) {
            throw new BusinessException("District is required");
        }
        if (dto.getCity() == null || dto.getCity().trim().isEmpty()) {
            throw new BusinessException("City is required");
        }
    }
    
    private ShippingAddressDTO toDTO(ShippingAddress address) {
        return ShippingAddressDTO.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .email(address.getEmail())
                .address(address.getAddress())
                .ward(address.getWard())
                .district(address.getDistrict())
                .city(address.getCity())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
