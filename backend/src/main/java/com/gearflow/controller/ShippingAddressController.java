package com.gearflow.controller;

import com.gearflow.dto.ShippingAddressDTO;
import com.gearflow.security.UserPrincipal;
import com.gearflow.service.ShippingAddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipping-addresses")
@RequiredArgsConstructor
@Slf4j
public class ShippingAddressController {
    
    private final ShippingAddressService addressService;
    
    @GetMapping
    public ResponseEntity<List<ShippingAddressDTO>> getUserAddresses(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("GET /shipping-addresses - User: {} (ID: {})", userPrincipal.getUsername(), userId);
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }
    
    @GetMapping("/default")
    public ResponseEntity<ShippingAddressDTO> getDefaultAddress(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("GET /shipping-addresses/default - User: {} (ID: {})", userPrincipal.getUsername(), userId);
        ShippingAddressDTO address = addressService.getDefaultAddress(userId);
        if (address == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(address);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ShippingAddressDTO> getAddressById(
            @PathVariable String id,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("GET /shipping-addresses/{} - User: {} (ID: {})", id, userPrincipal.getUsername(), userId);
        return ResponseEntity.ok(addressService.getAddressById(userId, id));
    }
    
    @PostMapping
    public ResponseEntity<ShippingAddressDTO> createAddress(
            @RequestBody ShippingAddressDTO dto,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("POST /shipping-addresses - User: {} (ID: {})", userPrincipal.getUsername(), userId);
        return ResponseEntity.ok(addressService.createAddress(userId, dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ShippingAddressDTO> updateAddress(
            @PathVariable String id,
            @RequestBody ShippingAddressDTO dto,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("PUT /shipping-addresses/{} - User: {} (ID: {})", id, userPrincipal.getUsername(), userId);
        return ResponseEntity.ok(addressService.updateAddress(userId, id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable String id,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("DELETE /shipping-addresses/{} - User: {} (ID: {})", id, userPrincipal.getUsername(), userId);
        addressService.deleteAddress(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/set-default")
    public ResponseEntity<ShippingAddressDTO> setDefaultAddress(
            @PathVariable String id,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        log.info("POST /shipping-addresses/{}/set-default - User: {} (ID: {})", id, userPrincipal.getUsername(), userId);
        return ResponseEntity.ok(addressService.setDefaultAddress(userId, id));
    }
}
