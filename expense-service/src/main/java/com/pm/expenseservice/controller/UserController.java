package com.pm.expenseservice.controller;

import com.pm.expenseservice.dto.common.ApiResponse;
import com.pm.expenseservice.dto.request.ChangePasswordDto;
import com.pm.expenseservice.dto.request.UpdateProfileDto;
import com.pm.expenseservice.dto.request.UpdatePreferencesDto;
import com.pm.expenseservice.dto.response.UserProfileDto;
import com.pm.expenseservice.dto.response.UserPreferencesDto;
import com.pm.expenseservice.security.CurrentUser;
import com.pm.expenseservice.service.UserService; // Add this import
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@CurrentUser Long userId) {
        log.info("Getting profile for user: {}", userId);
        UserProfileDto profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    /**
     * Update user profile (firstName, lastName)
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @CurrentUser Long userId,
            @Valid @RequestBody UpdateProfileDto dto) {

        log.info("Updating profile for user: {}", userId);
        UserProfileDto updated = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    /**
     * Change user password
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @CurrentUser Long userId,
            @Valid @RequestBody ChangePasswordDto dto) {

        log.info("Changing password for user: {}", userId);
        userService.changePassword(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    /**
     * Upload user avatar
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @CurrentUser Long userId,
            @RequestParam("avatar") MultipartFile file) {

        log.info("Uploading avatar for user: {}, file: {}", userId, file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a file to upload"));
        }

        String avatarUrl = userService.uploadAvatar(userId, file);
        return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", avatarUrl));
    }

    /**
     * Delete user avatar
     */
    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar(@CurrentUser Long userId) {
        log.info("Deleting avatar for user: {}", userId);
        userService.deleteAvatar(userId);
        return ResponseEntity.ok(ApiResponse.success("Avatar deleted successfully", null));
    }

    /**
     * Get user preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferencesDto>> getPreferences(@CurrentUser Long userId) {
        log.info("Getting preferences for user: {}", userId);
        UserPreferencesDto preferences = userService.getUserPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success("Preferences retrieved successfully", preferences));
    }

    /**
     * Update user preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferencesDto>> updatePreferences(
            @CurrentUser Long userId,
            @Valid @RequestBody UpdatePreferencesDto dto) {

        log.info("Updating preferences for user: {}", userId);
        UserPreferencesDto updated = userService.updatePreferences(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("Preferences updated successfully", updated));
    }
}