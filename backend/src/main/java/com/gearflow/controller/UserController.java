package com.gearflow.controller;

import com.gearflow.dto.UserDTO;
import com.gearflow.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/users/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> updateUserProfile(
        @PathVariable String id,
        @RequestBody UserDTO userDTO,
        @AuthenticationPrincipal com.gearflow.security.UserPrincipal principal) {
        // Allow update if user is updating their own profile or is admin
        if (!principal.getId().equals(id) && !principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new com.gearflow.exception.BusinessException("Access denied",
                org.springframework.http.HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserProfile(
        @PathVariable String id,
        @AuthenticationPrincipal com.gearflow.security.UserPrincipal principal) {
        if (!principal.getId().equals(id) && !principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new com.gearflow.exception.BusinessException("Access denied",
                org.springframework.http.HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        userService.changePassword(request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<UserDTO>> getAllUsers(org.springframework.data.domain.Pageable pageable) {
        log.info("GET /api/admin/users");
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getAdminUserById(@PathVariable String id) {
        log.info("GET /api/admin/users/{}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/admin/users/by-role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<UserDTO>> getUsersByRole(@PathVariable String role) {
        log.info("GET /api/admin/users/by-role/{}", role);
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/admin/users/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Long>> getTotalUserCount() {
        log.info("GET /api/admin/users/count");
        return ResponseEntity.ok(java.util.Map.of("totalUsers", userService.getTotalUserCount()));
    }

    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        log.info("PUT /api/admin/users/{}/role - Role: {}", id, request.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, request.get("role")));
    }

    @PutMapping("/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable String id) {
        log.info("PUT /api/admin/users/{}/toggle-status", id);
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        log.info("DELETE /api/admin/users/{}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/users/delete-multiple")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMultipleUsers(@RequestBody java.util.Map<String, Object> request) {
        log.info("POST /api/admin/users/delete-multiple");
        @SuppressWarnings("unchecked")
        java.util.List<String> userIds = (java.util.List<String>) request.get("userIds");
        userService.deleteMultipleUsers(userIds);
        return ResponseEntity.ok().build();
    }

    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
