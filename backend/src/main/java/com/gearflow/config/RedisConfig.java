package com.gearflow.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Redis configuration disabled for development.
 * Using in-memory caching via CacheConfig instead.
 */
@Configuration
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true", matchIfMissing = false)
public class RedisConfig {
    // Redis beans disabled - using in-memory cache instead
}
