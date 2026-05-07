package com.gearflow.service;

import com.gearflow.dto.UserDTO;
import com.gearflow.entity.User;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO updateUser(String id, UserDTO userDTO) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            // Check if email is already taken by another user
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                User existingUser = userRepository.findByEmail(userDTO.getEmail()).orElse(null);
                if (existingUser != null && !existingUser.getId().equals(id)) {
                    throw new com.gearflow.exception.BusinessException("Email already in use", 
                        org.springframework.http.HttpStatus.CONFLICT);
                }
            }
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhone() != null && !userDTO.getPhone().isEmpty()) {
            user.setPhone(userDTO.getPhone());
        }
        if (userDTO.getAddress() != null && !userDTO.getAddress().isEmpty()) {
            user.setAddress(userDTO.getAddress());
        }

        User updated = userRepository.save(user);
        return convertToDTO(updated);
    }

    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        // Get current user from security context
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new com.gearflow.exception.BusinessException("User not authenticated", 
                org.springframework.http.HttpStatus.UNAUTHORIZED);
        }

        com.gearflow.security.UserPrincipal userPrincipal = 
            (com.gearflow.security.UserPrincipal) authentication.getPrincipal();
        
        User user = userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new com.gearflow.exception.BusinessException("Old password is incorrect", 
                org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", user.getUsername());
    }

    @Transactional
    public void updateUserImage(String userId, String imageUrl) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setImageUrl(imageUrl);
        userRepository.save(user);
        log.info("User image updated for user: {}", userId);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UserDTO> getAllUsers(org.springframework.data.domain.Pageable pageable) {
        log.info("Fetching all users");
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public java.util.List<UserDTO> getUsersByRole(String role) {
        log.info("Fetching users with role: {}", role);
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            return userRepository.findAll().stream()
                    .filter(user -> user.getRole() != null && user.getRole().equals(userRole))
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role: {}", role);
            return java.util.List.of();
        }
    }

    @Transactional
    public void deleteUser(String id) {
        log.info("Deleting user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
        log.info("User deleted with id: {}", id);
    }

    @Transactional
    public void deleteMultipleUsers(java.util.List<String> userIds) {
        log.info("Deleting {} users", userIds.size());
        java.util.List<User> users = userRepository.findAllById(userIds);
        userRepository.deleteAll(users);
        log.info("Deleted {} users", users.size());
    }

    @Transactional(readOnly = true)
    public long getTotalUserCount() {
        log.info("Fetching total user count");
        return userRepository.count();
    }

    @Transactional
    public UserDTO updateUserRole(String id, String role) {
        log.info("Updating user {} role to {}", id, role);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            user.setRole(userRole);
            User updated = userRepository.save(user);
            log.info("User role updated successfully");
            return convertToDTO(updated);
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", role);
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .phone(user.getPhone())
            .address(user.getAddress())
            .imageUrl(user.getImageUrl())
            .role(user.getRole().toString())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
