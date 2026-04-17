package com.gearflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import com.gearflow.service.JwtTokenService;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpirationMs;

    @Autowired(required = false)
    private JwtTokenService jwtTokenService;

    public String generateAccessToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = generateToken(userPrincipal.getId(), jwtExpirationMs);
        
        // Save token to database
        if (jwtTokenService != null) {
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtExpirationMs / 1000);
            jwtTokenService.saveToken(userPrincipal.getId(), token, expiresAt);
        }
        
        return token;
    }

    public String generateAccessToken(String userId) {
        String token = generateToken(userId, jwtExpirationMs);
        
        // Save token to database
        if (jwtTokenService != null) {
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtExpirationMs / 1000);
            jwtTokenService.saveToken(userId, token, expiresAt);
        }
        
        return token;
    }

    public String generateRefreshToken(String userId) {
        String token = generateToken(userId, refreshTokenExpirationMs);
        
        // Save refresh token to database
        if (jwtTokenService != null) {
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000);
            jwtTokenService.saveToken(userId, token, expiresAt);
        }
        
        return token;
    }

    private String generateToken(String userId, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
            .subject(userId)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact();
    }

    public String getUserIdFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            // First, check JWT signature validity
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            
            // Second, check token status in database
            if (jwtTokenService != null) {
                return jwtTokenService.isTokenValid(token);
            }
            
            return true;
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
