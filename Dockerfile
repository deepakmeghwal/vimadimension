# Multi-stage Dockerfile for ArchiEase Spring Boot Application (Backend Only)
# Frontend is deployed separately to S3 + CloudFront

# Stage 1: Build Backend (No frontend embedding)
# Use x86_64 platform for T3 micro/small instances (not Apple Silicon)
FROM --platform=linux/amd64 gradle:8.13-jdk21 AS backend-builder
ARG CACHEBUST=1

WORKDIR /app

# Copy Gradle files
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle/ ./gradle/

# Copy source code
COPY src/ ./src/

# Build the application (backend API only, no static files)
RUN gradle bootJar --no-daemon

# Stage 3: Runtime
# Use x86_64 platform for T3 micro/small instances (not Apple Silicon)
FROM --platform=linux/amd64 eclipse-temurin:21-jre-alpine

# Install necessary packages
RUN apk add --no-cache \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Set timezone (optional, adjust as needed)
ENV TZ=UTC

# Create app user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directories (including uploads for local storage fallback)
RUN mkdir -p /app/logs /app/data /app/uploads && \
    chown -R appuser:appgroup /app

WORKDIR /app

# Copy JAR from builder stage
COPY --from=backend-builder /app/build/libs/*.jar app.jar

# Change ownership
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM options for production (optimized for T3 small: 2GB RAM)
# Increased heap: 512MB min, 1.5GB max (leaving ~500MB for OS and non-heap)
# Added GC and performance tuning flags
ENV JAVA_OPTS="-Xms512m -Xmx1536m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/app/logs/heap-dump.hprof \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

