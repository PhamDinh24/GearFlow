package com.gearflow.service;

import com.gearflow.dto.AuthRequest;
import com.gearflow.dto.AuthResponse;
import com.gearflow.dto.RegisterRequest;
import com.gearflow.dto.UserDTO;
import com.gearflow.entity.User;
import com.gearflow.exception.BusinessException;
import com.gearflow.repository.UserRepository;
import com.gearflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmailNotificationService emailNotificationService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username already registered", HttpStatus.CONFLICT, "Conflict");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered", HttpStatus.CONFLICT, "Conflict");
        }

        User user = User.builder()
                .id(java.util.UUID.randomUUID().toString())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone() : "")
                .address(request.getAddress() != null ? request.getAddress() : "")
                .role(User.UserRole.USER)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", request.getUsername());

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(convertToDTO(user))
                .username(user.getUsername())
                .role(user.getRole().toString())
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        // Authenticate with username or email
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Find user by username or email
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));
        
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        log.info("User logged in successfully: {} (login with: {})", user.getUsername(), request.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(convertToDTO(user))
                .username(user.getUsername())
                .role(user.getRole().toString())
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateAccessToken(userId);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);
        User user = userRepository.findById(userId).orElseThrow();

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(convertToDTO(user))
                .username(user.getUsername())
                .role(user.getRole().toString())
                .tokenType("Bearer")
                .build();
    }

    @Transactional
    public void initiatePasswordReset(String email) {
        log.info("Initiating password reset for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found with email: " + email, HttpStatus.NOT_FOUND));

        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpires(java.time.LocalDateTime.now().plusHours(24));

        userRepository.save(user);
        
        // Send email with reset link
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailNotificationService.sendPasswordResetEmail(email, resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password using token");
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new BusinessException("Invalid or expired token", HttpStatus.BAD_REQUEST));

        if (user.getResetPasswordExpires() == null || user.getResetPasswordExpires().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessException("Password reset token has expired", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);

        userRepository.save(user);
        log.info("Password successfully reset for user: {}", user.getUsername());
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole().toString())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
