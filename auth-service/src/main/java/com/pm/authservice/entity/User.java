package com.pm.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email", columnList = "email"),
        @Index(name = "idx_verification_token", columnList = "verificationToken")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isEnabled = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAccountNonExpired = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAccountNonLocked = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCredentialsNonExpired = true;

    private String verificationToken;

    private LocalDateTime verificationTokenExpiry;

    private String passwordResetToken;

    private LocalDateTime passwordResetTokenExpiry;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    private LocalDateTime lockTime;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}