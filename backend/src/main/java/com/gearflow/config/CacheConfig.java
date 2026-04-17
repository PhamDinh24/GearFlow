package com.gearflow.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Use in-memory cache instead of Redis for development
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
            "sales_analytics"
        );
    }
}
