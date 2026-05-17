package com.gearflow.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    @Value("${spring.cache.redis.enabled:false}")
    private boolean redisEnabled;

    @Bean
    public CacheManager cacheManager(ObjectProvider<RedisConnectionFactory> connectionFactoryProvider) {
        RedisConnectionFactory connectionFactory = connectionFactoryProvider.getIfAvailable();
        
        if (redisEnabled && connectionFactory != null) {
            try {
                log.info("Testing Redis connection...");
                connectionFactory.getConnection().close();
                log.info("Redis connection successful, using RedisCacheManager");
                return RedisCacheManager.builder(connectionFactory)
                        .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10)))
                        .build();
            } catch (Exception e) {
                log.warn("Redis is enabled but connection failed: {}. Falling back to In-Memory cache.", e.getMessage());
            }
        }
        
        log.info("Using ConcurrentMapCacheManager (In-Memory)");
        return new ConcurrentMapCacheManager(
            "products",
            "product",
            "products_search",
            "products_filter",
            "facets",
            "recommendations_view",
            "recommendations_purchase",
            "recommendations_accessory",
            "recommendations_trending",
            "dashboard_stats",
            "top_products",
            "sales_report",
            "reviews",
            "wishlists",
            "related_products",
            "latest_products",
            "best_selling_products",
            "products_by_date",
            "popular_with_category",
            "random_products",
            "customer_recommendations",
            "product_analytics",
            "customer_analytics",
            "sales_analytics",
            "public_stats"
        );
    }
}
