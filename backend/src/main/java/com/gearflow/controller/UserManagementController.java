package com.gearflow.controller;

import com.gearflow.dto.UserDTO;
import com.gearflow.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {
    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) {
        log.info("GET /api/admin/users");
        return ResponseEntity.ok(userManagementService.getAllUsers(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        log.info("GET /api/admin/users/{}", id);
        return ResponseEntity.ok(userManagementService.getUserById(id));
    }

    @GetMapping("/by-role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        log.info("GET /api/admin/users/by-role/{}", role);
        return ResponseEntity.ok(userManagementService.getUsersByRole(role));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalUserCount() {
        log.info("GET /api/admin/users/count");
        return ResponseEntity.ok(Map.of("totalUsers", userManagementService.getTotalUserCount()));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        log.info("PUT /api/admin/users/{}/role - Role: {}", id, request.get("role"));
        String role = request.get("role");
        UserDTO user = userManagementService.updateUserRole(id, role);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        log.info("DELETE /api/admin/users/{}", id);
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete-multiple")
    public ResponseEntity<Void> deleteMultipleUsers(@RequestBody Map<String, Object> request) {
        log.info("POST /api/admin/users/delete-multiple");
        
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) request.get("userIds");
        
        userManagementService.deleteMultipleUsers(userIds);
        return ResponseEntity.ok().build();
    }
}
