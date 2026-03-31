package com.gearflow.service;

import com.gearflow.dto.UserDTO;
import com.gearflow.entity.User;
import com.gearflow.exception.ResourceNotFoundException;
import com.gearflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        log.info("Fetching all users");
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(String id) {
        log.info("Fetching user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(String role) {
        log.info("Fetching users with role: {}", role);
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            return userRepository.findAll().stream()
                    .filter(user -> user.getRole() != null && user.getRole().equals(userRole))
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role: {}", role);
            return List.of();
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
    public void deleteMultipleUsers(List<String> userIds) {
        log.info("Deleting {} users", userIds.size());
        
        List<User> users = userRepository.findAllById(userIds);
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
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().toString() : "USER")
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
