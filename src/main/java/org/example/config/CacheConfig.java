package org.example.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for the application.
 * 
 * This enables caching for financial health dashboard data to improve
 * performance at scale when dealing with thousands of organizations.
 * 
 * Cache eviction: 5 minutes TTL
 * Cache size: Maximum 1000 entries
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("financialHealth");
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES) // Cache expires 5 minutes after write
                .maximumSize(1000) // Maximum 1000 cache entries
                .recordStats()); // Enable cache statistics
        
        return cacheManager;
    }
}





