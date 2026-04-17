package com.gearflow.service;

import com.gearflow.dto.ShippingAddressDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;
import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressValidationService {
    
    // Regex patterns for validation
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10,11}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern POSTAL_CODE_PATTERN = Pattern.compile("^\\d{5,6}$");
    
    /**
     * Validate shipping address for completeness and format
     */
    public ValidationResult validateAddress(ShippingAddressDTO address) {
        log.info("Validating address for: {}", address.getFullName());
        
        // Check required fields
        if (address.getFullName() == null || address.getFullName().trim().isEmpty()) {
            return ValidationResult.error("Tên người nhận không được để trống");
        }
        
        if (address.getPhone() == null || address.getPhone().trim().isEmpty()) {
            return ValidationResult.error("Số điện thoại không được để trống");
        }
        
        if (!PHONE_PATTERN.matcher(address.getPhone().replaceAll("[^0-9]", "")).matches()) {
            return ValidationResult.error("Số điện thoại không hợp lệ (10-11 chữ số)");
        }
        
        if (address.getEmail() != null && !address.getEmail().trim().isEmpty()) {
            if (!EMAIL_PATTERN.matcher(address.getEmail()).matches()) {
                return ValidationResult.error("Email không hợp lệ");
            }
        }
        
        if (address.getAddress() == null || address.getAddress().trim().isEmpty()) {
            return ValidationResult.error("Địa chỉ chi tiết không được để trống");
        }
        
        if (address.getAddress().length() < 5) {
            return ValidationResult.error("Địa chỉ chi tiết quá ngắn (tối thiểu 5 ký tự)");
        }
        
        if (address.getWard() == null || address.getWard().trim().isEmpty()) {
            return ValidationResult.error("Phường/Xã không được để trống");
        }
        
        if (address.getDistrict() == null || address.getDistrict().trim().isEmpty()) {
            return ValidationResult.error("Quận/Huyện không được để trống");
        }
        
        if (address.getCity() == null || address.getCity().trim().isEmpty()) {
            return ValidationResult.error("Tỉnh/Thành phố không được để trống");
        }
        
        if (address.getPostalCode() != null && !address.getPostalCode().trim().isEmpty()) {
            if (!POSTAL_CODE_PATTERN.matcher(address.getPostalCode()).matches()) {
                return ValidationResult.error("Mã bưu chính không hợp lệ");
            }
        }
        
        return ValidationResult.success();
    }
    
    /**
     * Validate if address matches expected format (address similarity check)
     */
    public boolean isAddressFormatCorrect(String address) {
        if (address == null || address.trim().isEmpty()) {
            return false;
        }
        
        // Address should contain basic location info
        long wordCount = address.split("\\s+").length;
        return wordCount >= 2 && address.length() >= 5 && address.length() <= 500;
    }
    
    /**
     * Normalize phone number (remove spaces, dashes, etc)
     */
    public String normalizePhoneNumber(String phone) {
        return phone.replaceAll("[^0-9+]", "");
    }
    
    /**
     * Normalize full name (trim whitespace, capitalize properly)
     */
    public String normalizeFullName(String fullName) {
        if (fullName == null) return "";
        
        return Arrays.stream(fullName.trim().replaceAll("\\s+", " ").split(" "))
            .map(word -> {
                if (word.isEmpty()) return word;
                return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
            })
            .reduce((a, b) -> a + " " + b)
            .orElse("");
    }
    
    /**
     * Check if address is complete (has all required parts)
     */
    public boolean isAddressComplete(ShippingAddressDTO address) {
        return address.getFullName() != null && !address.getFullName().trim().isEmpty()
            && address.getPhone() != null && !address.getPhone().trim().isEmpty()
            && address.getAddress() != null && !address.getAddress().trim().isEmpty()
            && address.getWard() != null && !address.getWard().trim().isEmpty()
            && address.getDistrict() != null && !address.getDistrict().trim().isEmpty()
            && address.getCity() != null && !address.getCity().trim().isEmpty();
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        private ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public static ValidationResult success() {
            return new ValidationResult(true, "");
        }
        
        public static ValidationResult error(String message) {
            return new ValidationResult(false, message);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
