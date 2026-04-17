package com.gearflow.service;

import com.gearflow.entity.JwtToken;
import com.gearflow.repository.JwtTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final JwtTokenRepository jwtTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpirationMs;

    /**
     * Save a new JWT token to database
     */
    @Transactional
    public JwtToken saveToken(String userId, String token, LocalDateTime expiresAt) {
        log.info("Saving JWT token for user: {}", userId);
        
        JwtToken jwtToken = JwtToken.builder()
                .userId(userId)
                .token(token)
                .tokenType("Bearer")
                .expiresAt(expiresAt)
                .status(JwtToken.TokenStatus.ACTIVE)
                .build();

        return jwtTokenRepository.save(jwtToken);
    }

    /**
     * Validate token by checking database
     */
    public boolean isTokenValid(String token) {
        log.debug("Validating JWT token from database");
        
        Optional<JwtToken> jwtTokenOpt = jwtTokenRepository.findByToken(token);
        
        if (jwtTokenOpt.isEmpty()) {
            log.warn("Token not found in database");
            return false;
        }

        JwtToken jwtToken = jwtTokenOpt.get();
        
        // Check if token is valid (not revoked and not expired)
        if (!jwtToken.isValid()) {
            log.warn("Token is invalid - status: {}, expires: {}", 
                    jwtToken.getStatus(), jwtToken.getExpiresAt());
            return false;
        }

        // Update last used timestamp
        jwtToken.setLastUsedAt(LocalDateTime.now());
        jwtTokenRepository.save(jwtToken);

        return true;
    }

    /**
     * Get token by token string
     */
    public Optional<JwtToken> getToken(String token) {
        return jwtTokenRepository.findByToken(token);
    }

    /**
     * Get all active tokens for a user
     */
    public List<JwtToken> getActiveTokensForUser(String userId) {
        log.debug("Getting active tokens for user: {}", userId);
        return jwtTokenRepository.findActiveTokensByUserId(userId);
    }

    /**
     * Get all valid (not expired) tokens for a user
     */
    public List<JwtToken> getValidTokensForUser(String userId) {
        log.debug("Getting valid tokens for user: {}", userId);
        return jwtTokenRepository.findValidTokensByUserId(userId, LocalDateTime.now());
    }

    /**
     * Revoke a specific token
     */
    @Transactional
    public void revokeToken(String token) {
        log.info("Revoking JWT token");
        
        Optional<JwtToken> jwtTokenOpt = jwtTokenRepository.findByToken(token);
        if (jwtTokenOpt.isPresent()) {
            JwtToken jwtToken = jwtTokenOpt.get();
            jwtToken.revoke();
            jwtTokenRepository.save(jwtToken);
            log.info("Token revoked successfully");
        }
    }

    /**
     * Revoke all tokens for a specific user (logout all sessions)
     */
    @Transactional
    public void revokeAllUserTokens(String userId) {
        log.info("Revoking all tokens for user: {}", userId);
        
        List<JwtToken> userTokens = jwtTokenRepository.findByUserId(userId);
        for (JwtToken token : userTokens) {
            if (token.getStatus() == JwtToken.TokenStatus.ACTIVE) {
                token.revoke();
                jwtTokenRepository.save(token);
            }
        }
        
        log.info("Revoked {} tokens for user: {}", userTokens.size(), userId);
    }

    /**
     * Get the latest active token for a user
     */
    public Optional<JwtToken> getLatestActiveTokenForUser(String userId) {
        log.debug("Getting latest active token for user: {}", userId);
        return jwtTokenRepository.findLatestActiveTokenByUserId(userId, LocalDateTime.now());
    }

    /**
     * Count active tokens for a user
     */
    public long countActiveTokensForUser(String userId) {
        return jwtTokenRepository.countByUserIdAndStatus(userId, "ACTIVE");
    }

    /**
     * Cleanup expired tokens (scheduled task)
     */
    @Scheduled(fixedDelay = 3600000) // Run every 1 hour
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired JWT tokens");
        
        try {
            jwtTokenRepository.deleteExpiredTokens(LocalDateTime.now());
            log.info("Cleanup of expired tokens completed");
        } catch (Exception e) {
            log.error("Error during cleanup of expired tokens", e);
        }
    }
}
