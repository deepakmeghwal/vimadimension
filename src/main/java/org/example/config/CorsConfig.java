package org.example.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * CORS Configuration for S3 + CloudFront deployment
 * 
 * Allows requests from CloudFront distribution to Spring Boot API.
 * Configure allowed origins via application properties.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:}")
    private String allowedOrigins;

    @Value("${app.cors.enabled:true}")
    private boolean corsEnabled;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        if (corsEnabled && allowedOrigins != null && !allowedOrigins.isEmpty()) {
            // Split comma-separated origins
            List<String> origins = Arrays.asList(allowedOrigins.split(","));
            configuration.setAllowedOrigins(origins.stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
        } else {
            // Allow all origins in development (not recommended for production)
            configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*", "Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        // Expose custom headers if needed
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-Total-Count"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (corsEnabled && allowedOrigins != null && !allowedOrigins.isEmpty()) {
            List<String> origins = Arrays.asList(allowedOrigins.split(","));
            registry.addMapping("/api/**")
                    .allowedOrigins(origins.stream()
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .toArray(String[]::new))
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
        } else {
            // Development fallback (not recommended for production)
            registry.addMapping("/api/**")
                    .allowedOriginPatterns("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(false)
                    .maxAge(3600);
        }
    }
}

