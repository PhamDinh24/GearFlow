package com.gearflow.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitingConfig {

    @Value("${app.rate-limit.user-requests-per-minute:100}")
    private int userRequestsPerMinute;

    @Value("${app.rate-limit.admin-requests-per-minute:50}")
    private int adminRequestsPerMinute;

    @Value("${app.rate-limit.payment-requests-per-minute:10}")
    private int paymentRequestsPerMinute;

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key, String role) {
        return cache.computeIfAbsent(key, k -> createNewBucket(role));
    }

    private Bucket createNewBucket(String role) {
        int capacity = "ADMIN".equals(role) ? adminRequestsPerMinute : userRequestsPerMinute;
        Bandwidth limit = Bandwidth.classic(capacity, Refill.intervally(capacity, Duration.ofMinutes(1)));
        @SuppressWarnings("deprecation")
        Bucket bucket = Bucket4j.builder()
            .addLimit(limit)
            .build();
        return bucket;
    }

    public Bucket resolvePaymentBucket(String key) {
        return cache.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(paymentRequestsPerMinute, 
                Refill.intervally(paymentRequestsPerMinute, Duration.ofMinutes(1)));
            @SuppressWarnings("deprecation")
            Bucket bucket = Bucket4j.builder()
                .addLimit(limit)
                .build();
            return bucket;
        });
    }
}
