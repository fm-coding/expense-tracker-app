# Multi-stage build for smaller image size
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies (cached if pom.xml hasn't changed)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy AS runtime

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy the built jar from builder stage
COPY --from=builder /app/target/auth-service-*.jar ./app.jar

# Create directories for logs
RUN mkdir -p /app/logs && chown -R spring:spring /app

# Switch to non-root user
USER spring

# Expose the application port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8082/api/v1/auth/health || exit 1

# Run the application with JVM optimizations
ENTRYPOINT ["java", \
  "-Xmx512m", \
  "-Xms256m", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-docker}", \
  "-jar", \
  "app.jar"]
