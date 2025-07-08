package com.pm.authservice.controller;

import com.pm.authservice.dto.request.*;
import com.pm.authservice.dto.response.ApiResponseDto;
import com.pm.authservice.dto.response.AuthResponseDto;
import com.pm.authservice.dto.response.UserInfoDto;
import com.pm.authservice.security.UserPrincipal;
import com.pm.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<ApiResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.builder()
                        .success(true)
                        .message("Registration successful. Please check your email to verify your account.")
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-email/{token}")
    public ResponseEntity<?> verifyEmail(@PathVariable String token) {
        try {
            authService.verifyEmail(token);
            log.info("✅ Email verification successful for token: {}", token);

            String redirectUrl = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/login")
                    .queryParam("verified", "true")
                    .queryParam("message", "Email verified successfully")
                    .build()
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Location", redirectUrl);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);

        } catch (Exception e) {
            log.error("❌ Email verification failed for token {}: {}", token, e.getMessage());

            String redirectUrl = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/login")
                    .queryParam("error", "verification_failed")
                    .queryParam("message", "Verification failed")
                    .build()
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Location", redirectUrl);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    @GetMapping("/verify-email-json/{token}")
    public ResponseEntity<ApiResponseDto> verifyEmailJson(@PathVariable String token) {
        try {
            authService.verifyEmail(token);
            log.info("✅ Email verification successful for token: {}", token);

            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("Email verified successfully. You can now login to your account.")
                    .build());
        } catch (Exception e) {
            log.error("❌ Email verification failed for token {}: {}", token, e.getMessage());

            return ResponseEntity.badRequest().body(ApiResponseDto.builder()
                    .success(false)
                    .message("Verification failed: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/verify-email-simple/{token}")
    public ResponseEntity<String> verifyEmailSimple(@PathVariable String token) {
        try {
            authService.verifyEmail(token);
            log.info("✅ Email verification successful for token: {}", token);

            return ResponseEntity.ok("""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email Verified - PM System</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                        .btn { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success">✅ Email Verified Successfully!</div>
                        <p>Your account has been verified. You can now log in to PIM System.</p>
                        <a href="%s/login" class="btn">Go to Login</a>
                    </div>
                </body>
                </html>
                """.formatted(frontendUrl));

        } catch (Exception e) {
            log.error("❌ Email verification failed for token {}: {}", token, e.getMessage());

            return ResponseEntity.badRequest().body("""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Verification Failed - PM System</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
                        .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error">❌ Verification Failed</div>
                        <p>There was an error verifying your email. Please try again or contact support.</p>
                        <a href="%s/login" class="btn">Go to Login</a>
                    </div>
                </body>
                </html>
                """.formatted(frontendUrl));
        }
    }

    @PostMapping("/resend-verification/{email}")
    public ResponseEntity<ApiResponseDto> resendVerificationEmail(@PathVariable String email) {
        authService.resendVerificationEmail(email);

        return ResponseEntity.ok(ApiResponseDto.builder()
                .success(true)
                .message("Verification email sent successfully. Please check your email.")
                .build());
    }

    // UPDATED: Enhanced Forgot Password - Now accepts JSON body with validation
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        try {
            authService.forgotPassword(request.getEmail());
            log.info("🔐 Password reset email sent for: {}", request.getEmail());

            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("If an account with this email exists, you will receive password reset instructions shortly.")
                    .build());
        } catch (Exception e) {
            log.error("❌ Failed to process forgot password request for: {}", request.getEmail(), e);

            // Security: Always return success to prevent email enumeration
            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("If an account with this email exists, you will receive password reset instructions shortly.")
                    .build());
        }
    }

    // NEW: Validate Reset Token (Check if token is valid before showing form)
    @GetMapping("/reset-password/validate/{token}")
    public ResponseEntity<ApiResponseDto> validateResetToken(@PathVariable String token) {
        try {
            boolean isValid = authService.validatePasswordResetToken(token);

            if (isValid) {
                return ResponseEntity.ok(ApiResponseDto.builder()
                        .success(true)
                        .message("Reset token is valid. You can proceed to reset your password.")
                        .build());
            } else {
                return ResponseEntity.badRequest().body(ApiResponseDto.builder()
                        .success(false)
                        .message("Invalid or expired reset token. Please request a new password reset.")
                        .build());
            }
        } catch (Exception e) {
            log.error("❌ Token validation failed: {}", e.getMessage());

            return ResponseEntity.badRequest().body(ApiResponseDto.builder()
                    .success(false)
                    .message("Token validation failed: " + e.getMessage())
                    .build());
        }
    }

    // UPDATED: Enhanced Reset Password with better validation and error handling
    @PostMapping("/reset-password/{token}")
    public ResponseEntity<ApiResponseDto> resetPassword(
            @PathVariable String token,
            @Valid @RequestBody ResetPasswordRequestDto request) {

        try {
            // Validate password confirmation
            if (!request.isPasswordMatching()) {
                return ResponseEntity.badRequest().body(ApiResponseDto.builder()
                        .success(false)
                        .message("New password and confirm password do not match.")
                        .build());
            }

            authService.resetPassword(token, request.getNewPassword());
            log.info("✅ Password reset successful for token: {}", token);

            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("Password reset successfully. You can now login with your new password.")
                    .build());
        } catch (Exception e) {
            log.error("❌ Password reset failed for token {}: {}", token, e.getMessage());

            return ResponseEntity.badRequest().body(ApiResponseDto.builder()
                    .success(false)
                    .message("Password reset failed: " + e.getMessage())
                    .build());
        }
    }

    // NEW: Reset Password Form Redirect (For email links)
    @GetMapping("/reset-password/{token}")
    public ResponseEntity<?> showResetPasswordForm(@PathVariable String token) {
        try {
            boolean isValid = authService.validatePasswordResetToken(token);

            if (isValid) {
                // Redirect to frontend reset password form with token
                String redirectUrl = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/reset-password")
                        .queryParam("token", token)
                        .queryParam("valid", "true")
                        .build()
                        .toUriString();

                HttpHeaders headers = new HttpHeaders();
                headers.add("Location", redirectUrl);
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            } else {
                // Redirect to frontend with error
                String redirectUrl = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/login")
                        .queryParam("error", "invalid_reset_token")
                        .queryParam("message", "Invalid or expired reset token")
                        .build()
                        .toUriString();

                HttpHeaders headers = new HttpHeaders();
                headers.add("Location", redirectUrl);
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            }
        } catch (Exception e) {
            log.error("❌ Reset form validation failed: {}", e.getMessage());

            String redirectUrl = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/login")
                    .queryParam("error", "reset_error")
                    .queryParam("message", "Password reset error")
                    .build()
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Location", redirectUrl);
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    // NEW: Simple Reset Password Form (HTML fallback)
    @GetMapping("/reset-password-form/{token}")
    public ResponseEntity<String> showResetPasswordFormHtml(@PathVariable String token) {
        try {
            boolean isValid = authService.validatePasswordResetToken(token);

            if (isValid) {
                return ResponseEntity.ok(String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Reset Password - PM System</title>
                        <style>
                            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
                            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                            .form-group { margin-bottom: 20px; }
                            label { display: block; margin-bottom: 5px; font-weight: bold; }
                            input[type="password"] { width: 100%%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
                            .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%%; }
                            .btn:hover { background: #0056b3; }
                            .requirements { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>🔐 Reset Your Password</h2>
                            <p>Enter your new password below. Make sure it meets all security requirements.</p>
                            
                            <form action="%s/api/v1/auth/reset-password/%s" method="post">
                                <div class="form-group">
                                    <label for="newPassword">New Password:</label>
                                    <input type="password" id="newPassword" name="newPassword" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password:</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                                </div>
                                
                                <div class="requirements">
                                    <strong>Password Requirements:</strong>
                                    <ul>
                                        <li>At least 8 characters long</li>
                                        <li>Contains uppercase and lowercase letters</li>
                                        <li>Contains at least one number</li>
                                        <li>Contains at least one special character (@$!%%*?&)</li>
                                    </ul>
                                </div>
                                
                                <button type="submit" class="btn">Reset Password</button>
                            </form>
                            
                            <p style="text-align: center; margin-top: 20px;">
                                <a href="%s/login">← Back to Login</a>
                            </p>
                        </div>
                    </body>
                    </html>
                    """, frontendUrl, token, frontendUrl));
            } else {
                return ResponseEntity.badRequest().body("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Invalid Token - PM System</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
                            .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">❌ Invalid Reset Token</div>
                            <p>This password reset link is invalid or has expired. Please request a new password reset.</p>
                            <a href="%s/login" class="btn">Go to Login</a>
                        </div>
                    </body>
                    </html>
                    """.formatted(frontendUrl));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error - PM System</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
                        .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error">❌ Error</div>
                        <p>An error occurred while processing your request. Please try again later.</p>
                        <a href="%s/login" class="btn">Go to Login</a>
                    </div>
                </body>
                </html>
                """.formatted(frontendUrl));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponseDto> health() {
        return ResponseEntity.ok(ApiResponseDto.builder()
                .success(true)
                .message("Auth service is running")
                .build());
    }

    /**
     * Get current authenticated user's profile
     */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponseDto> getCurrentUserProfile(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UserInfoDto userInfo = authService.getUserProfile(userPrincipal.getId());

            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("Profile retrieved successfully")
                    .data(userInfo)
                    .build());
        } catch (Exception e) {
            log.error("Error getting user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.builder()
                            .success(false)
                            .message("Failed to retrieve profile: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Update authenticated user's profile
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponseDto> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileDto dto) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UserInfoDto updatedUser = authService.updateUserProfile(userPrincipal.getId(), dto);

            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("Profile updated successfully")
                    .data(updatedUser)
                    .build());
        } catch (Exception e) {
            log.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseDto.builder()
                            .success(false)
                            .message("Failed to update profile: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Change authenticated user's password
     */
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponseDto> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordDto dto) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            authService.changePassword(userPrincipal.getId(), dto);

            return ResponseEntity.ok(ApiResponseDto.builder()
                    .success(true)
                    .message("Password changed successfully")
                    .build());
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseDto.builder()
                            .success(false)
                            .message("Current password is incorrect")
                            .build());
        } catch (Exception e) {
            log.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseDto.builder()
                            .success(false)
                            .message("Failed to change password: " + e.getMessage())
                            .build());
        }
    }
}