package com.pm.authservice.service;

import com.pm.authservice.repository.UserRepository;
import com.pm.authservice.dto.request.LoginRequestDto;
import com.pm.authservice.dto.request.RegisterRequestDto;
import com.pm.authservice.dto.response.AuthResponseDto;
import com.pm.authservice.dto.response.UserInfoDto;
import com.pm.authservice.entity.User;
import com.pm.authservice.exception.AccountLockedException;
import com.pm.authservice.exception.AccountNotVerifiedException;
import com.pm.authservice.exception.BadRequestException;
import com.pm.authservice.exception.ResourceNotFoundException;
import com.pm.authservice.security.UserPrincipal;
import com.pm.authservice.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_TIME_DURATION = 30; // minutes
    private static final int PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1; // 1 hour expiry

    @Transactional
    public void register(@Valid RegisterRequestDto request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        // Check if user already exists
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("User with this email already exists");
        }

        // Create verification token
        String verificationToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);

        // Create user entity
        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .isEnabled(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(tokenExpiry)
                .build();

        User savedUser = userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(
                savedUser.getEmail(),
                savedUser.getFirstName(),
                verificationToken
        );

        log.info("User registered successfully with email: {}", savedUser.getEmail());
    }

    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        log.info("Attempting to login user with email: {}", request.getEmail());

        String email = request.getEmail().toLowerCase().trim();

        // Check if user exists
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if account is locked
        if (isAccountLocked(user)) {
            throw new AccountLockedException("Account is locked due to multiple failed login attempts. Please try again later.");
        }

        // Check if account is verified
        if (!user.getIsEnabled()) {
            throw new AccountNotVerifiedException("Please verify your email address before logging in");
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            // Reset failed attempts on successful login
            userRepository.resetFailedAttempts(email, LocalDateTime.now());

            // Generate tokens
            String accessToken = jwtUtil.generateAccessToken(authentication);
            String refreshToken = jwtUtil.generateRefreshToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            UserInfoDto userInfo = UserInfoDto.builder()
                    .id(userPrincipal.getId())
                    .firstName(userPrincipal.getFirstName())
                    .lastName(userPrincipal.getLastName())
                    .email(userPrincipal.getEmail())
                    .isEnabled(userPrincipal.isEnabled())
                    .createdAt(user.getCreatedAt())
                    .lastLoginAt(LocalDateTime.now())
                    .build();

            log.info("User logged in successfully: {}", email);

            return AuthResponseDto.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtUtil.getAccessTokenExpirationMs())
                    .user(userInfo)
                    .issuedAt(LocalDateTime.now())
                    .build();

        } catch (AuthenticationException e) {
            // Increment failed attempts
            int failedAttempts = user.getFailedLoginAttempts() + 1;
            LocalDateTime lockTime = null;

            if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                lockTime = LocalDateTime.now();
                log.warn("Account locked for user: {} due to {} failed attempts", email, failedAttempts);
            }

            userRepository.updateFailedAttempts(email, failedAttempts, lockTime);

            if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                throw new AccountLockedException("Account locked due to multiple failed login attempts");
            }

            throw new BadCredentialsException("Invalid email or password");
        }
    }

    @Transactional
    public void verifyEmail(String token) {
        log.info("Attempting to verify email with token: {}", token);

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }

        if (user.getIsEnabled()) {
            throw new BadRequestException("Account is already verified");
        }

        user.setIsEnabled(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        log.info("Attempting to resend verification email to: {}", email);

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (user.getIsEnabled()) {
            throw new BadRequestException("Account is already verified");
        }

        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);

        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(tokenExpiry);

        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getFirstName(),
                verificationToken
        );

        log.info("Verification email resent successfully to: {}", email);
    }

    // ENHANCED: Forgot Password with Security Best Practices
    @Transactional
    public void forgotPassword(String email) {
        log.info("Processing forgot password request for email: {}", email);

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);

        if (userOptional.isEmpty()) {
            log.warn("Forgot password requested for non-existent email: {}", email);
            // Security: Don't reveal if email exists or not
            // Still return success to prevent email enumeration attacks
            return;
        }

        User user = userOptional.get();

        // Check if account is verified
        if (!user.getIsEnabled()) {
            log.warn("Password reset requested for unverified account: {}", email);
            // Still send success response for security
            return;
        }

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusHours(PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

        // Update user with reset token
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(expiryTime);
        userRepository.save(user);

        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetToken);

        log.info("Password reset token generated and email sent for user: {}", email);
    }

    // NEW: Validate Password Reset Token
    public boolean validatePasswordResetToken(String token) {
        log.info("Validating password reset token: {}", token);

        Optional<User> userOptional = userRepository.findByPasswordResetToken(token);

        if (userOptional.isEmpty()) {
            log.warn("Invalid password reset token: {}", token);
            return false;
        }

        User user = userOptional.get();

        // Check if token is expired
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            log.warn("Expired password reset token for user: {}", user.getEmail());
            return false;
        }

        log.info("Valid password reset token for user: {}", user.getEmail());
        return true;
    }

    // ENHANCED: Reset Password with Better Error Handling
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Attempting password reset with token: {}", token);

        Optional<User> userOptional = userRepository.findByPasswordResetToken(token);

        if (userOptional.isEmpty()) {
            throw new BadRequestException("Invalid reset token");
        }

        User user = userOptional.get();

        // Check if token is expired
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired. Please request a new password reset.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear reset token
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);

        // Reset failed login attempts and unlock account
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);

        // Update timestamp
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    private boolean isAccountLocked(User user) {
        if (user.getLockTime() == null) {
            return false;
        }

        LocalDateTime unlockTime = user.getLockTime().plusMinutes(LOCK_TIME_DURATION);
        return LocalDateTime.now().isBefore(unlockTime);
    }
}