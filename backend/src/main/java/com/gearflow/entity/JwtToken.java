package com.gearflow.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jwt_tokens", indexes = {
    @Index(name = "idx_jwt_user", columnList = "user_id"),
    @Index(name = "idx_jwt_token", columnList = "token", unique = true),
    @Index(name = "idx_jwt_expiry", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "token_id", columnDefinition = "UUID")
    private java.util.UUID id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "token", nullable = false, columnDefinition = "TEXT", unique = true)
    private String token;

    @Column(name = "token_type", nullable = false, length = 50)
    @Builder.Default
    private String tokenType = "Bearer";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TokenStatus status = TokenStatus.ACTIVE;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    public enum TokenStatus {
        ACTIVE, REVOKED, EXPIRED
    }

    public boolean isValid() {
        return status == TokenStatus.ACTIVE && expiresAt.isAfter(LocalDateTime.now());
    }

    public void revoke() {
        this.status = TokenStatus.REVOKED;
        this.revokedAt = LocalDateTime.now();
    }
}
