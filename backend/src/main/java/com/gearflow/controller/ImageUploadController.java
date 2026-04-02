package com.gearflow.controller;

import com.gearflow.dto.ProductDTO;
import com.gearflow.dto.UserDTO;
import com.gearflow.service.CloudinaryService;
import com.gearflow.service.ProductService;
import com.gearflow.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Slf4j
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;
    private final ProductService productService;
    private final UserService userService;

    @PostMapping("/products/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @PathVariable String productId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            log.info("Uploading image for product: {}", productId);
            
            // Upload to Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file, "gearflow/products");
            
            // Update product
            ProductDTO product = productService.getProductById(productId);
            
            // Delete old image if exists
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                cloudinaryService.deleteImage(product.getImageUrl());
            }
            
            // Update product with new image URL
            productService.updateProductImage(productId, imageUrl);
            
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading product image", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadUserImage(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            String currentUserId = authentication.getName();
            
            // Users can only upload their own image, admins can upload any
            if (!currentUserId.equals(userId) && !authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            
            log.info("Uploading image for user: {}", userId);
            
            // Upload to Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file, "gearflow/users");
            
            // Update user
            UserDTO user = userService.getUserById(userId);
            
            // Delete old image if exists
            if (user.getImageUrl() != null && !user.getImageUrl().isEmpty()) {
                cloudinaryService.deleteImage(user.getImageUrl());
            }
            
            // Update user with new image URL
            userService.updateUserImage(userId, imageUrl);
            
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading user image", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/products/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteProductImage(@PathVariable String productId) {
        try {
            log.info("Deleting image for product: {}", productId);
            
            ProductDTO product = productService.getProductById(productId);
            
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                cloudinaryService.deleteImage(product.getImageUrl());
                productService.updateProductImage(productId, null);
            }
            
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting product image", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUserImage(
            @PathVariable String userId,
            Authentication authentication
    ) {
        try {
            String currentUserId = authentication.getName();
            
            // Users can only delete their own image, admins can delete any
            if (!currentUserId.equals(userId) && !authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            }
            
            log.info("Deleting image for user: {}", userId);
            
            UserDTO user = userService.getUserById(userId);
            
            if (user.getImageUrl() != null && !user.getImageUrl().isEmpty()) {
                cloudinaryService.deleteImage(user.getImageUrl());
                userService.updateUserImage(userId, null);
            }
            
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting user image", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
