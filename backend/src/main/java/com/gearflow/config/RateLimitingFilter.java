package com.gearflow.config;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitingConfig rateLimitingConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        
        // Skip rate limiting for public endpoints
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = authentication.getName();
        String role = authentication.getAuthorities().stream()
            .map(auth -> auth.getAuthority())
            .findFirst()
            .orElse("USER");

        Bucket bucket;
        if (path.contains("/payments")) {
            bucket = rateLimitingConfig.resolvePaymentBucket(userId);
        } else {
            bucket = rateLimitingConfig.resolveBucket(userId, role);
        }

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", "60");
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), 
                "You have exhausted your API Request Quota");
            log.warn("Rate limit exceeded for user: {} on path: {}", userId, path);
        }
    }

    private boolean isPublicEndpoint(String path) {
        return path.contains("/auth/") || 
               path.contains("/products/search") ||
               path.contains("/products/") && path.contains("/variants") ||
               path.contains("/reviews/product");
    }
}
