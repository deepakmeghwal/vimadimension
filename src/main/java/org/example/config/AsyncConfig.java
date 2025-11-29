package org.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration for async operations and scheduling.
 * Enables @Async for non-blocking email sending.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
    // Uses default SimpleAsyncTaskExecutor
    // For production, you might want to configure a custom ThreadPoolTaskExecutor
}







