package com.pm.expenseservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 32 characters long for HS256");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (Exception ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }

    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Get userId from claims, not from subject
            // The subject contains the email
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            log.error("Error extracting userId from token: {}", e.getMessage());
            throw new IllegalArgumentException("Could not extract userId from token", e);
        }
    }

    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // The subject contains the email
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error extracting email from token: {}", e.getMessage());
            throw new IllegalArgumentException("Could not extract email from token", e);
        }
    }
}