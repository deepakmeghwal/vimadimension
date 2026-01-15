package org.example.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Simple in-memory rate limiting filter for auth endpoints.
 * For production at scale, consider using Redis-based rate limiting.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Rate limit settings
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_REQUESTS_PER_HOUR = 50;
    
    // Endpoints to rate limit
    private static final String[] RATE_LIMITED_ENDPOINTS = {
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/organization/register",
        "/api/organization/resend-verification",
        "/api/invitations/accept"
    };

    // In-memory storage (use Redis for distributed systems)
    private final Map<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Only rate limit specific endpoints
        if (!shouldRateLimit(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = getClientKey(request);
        RateLimitInfo info = rateLimitMap.computeIfAbsent(clientKey, k -> new RateLimitInfo());

        // Clean up old entries periodically
        cleanupOldEntries();

        // Check rate limit
        if (info.isRateLimited()) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\",\"retryAfter\":" + info.getRetryAfterSeconds() + "}");
            return;
        }

        // Record this request
        info.recordRequest();

        filterChain.doFilter(request, response);
    }

    private boolean shouldRateLimit(String path) {
        for (String endpoint : RATE_LIMITED_ENDPOINTS) {
            if (path.equals(endpoint)) {
                return true;
            }
        }
        return false;
    }

    private String getClientKey(HttpServletRequest request) {
        // Try to get real IP from proxy headers
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        // Get first IP if multiple (from proxy chain)
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip + ":" + request.getRequestURI();
    }

    private void cleanupOldEntries() {
        long now = System.currentTimeMillis();
        rateLimitMap.entrySet().removeIf(entry -> 
            now - entry.getValue().getLastRequestTime() > TimeUnit.HOURS.toMillis(1)
        );
    }

    private static class RateLimitInfo {
        private int requestsThisMinute = 0;
        private int requestsThisHour = 0;
        private long minuteStart = System.currentTimeMillis();
        private long hourStart = System.currentTimeMillis();
        private long lastRequestTime = System.currentTimeMillis();

        public synchronized void recordRequest() {
            long now = System.currentTimeMillis();
            lastRequestTime = now;

            // Reset minute counter if minute has passed
            if (now - minuteStart > TimeUnit.MINUTES.toMillis(1)) {
                requestsThisMinute = 0;
                minuteStart = now;
            }

            // Reset hour counter if hour has passed
            if (now - hourStart > TimeUnit.HOURS.toMillis(1)) {
                requestsThisHour = 0;
                hourStart = now;
            }

            requestsThisMinute++;
            requestsThisHour++;
        }

        public synchronized boolean isRateLimited() {
            long now = System.currentTimeMillis();

            // Check if counters need reset
            if (now - minuteStart > TimeUnit.MINUTES.toMillis(1)) {
                requestsThisMinute = 0;
                minuteStart = now;
            }
            if (now - hourStart > TimeUnit.HOURS.toMillis(1)) {
                requestsThisHour = 0;
                hourStart = now;
            }

            return requestsThisMinute >= MAX_REQUESTS_PER_MINUTE || 
                   requestsThisHour >= MAX_REQUESTS_PER_HOUR;
        }

        public long getRetryAfterSeconds() {
            long now = System.currentTimeMillis();
            if (requestsThisMinute >= MAX_REQUESTS_PER_MINUTE) {
                return Math.max(1, (minuteStart + TimeUnit.MINUTES.toMillis(1) - now) / 1000);
            }
            return Math.max(1, (hourStart + TimeUnit.HOURS.toMillis(1) - now) / 1000);
        }

        public long getLastRequestTime() {
            return lastRequestTime;
        }
    }
}








