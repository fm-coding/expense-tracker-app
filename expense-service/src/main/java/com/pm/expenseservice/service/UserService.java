package com.pm.expenseservice.service;

import com.pm.expenseservice.dto.request.ChangePasswordDto;
import com.pm.expenseservice.dto.request.UpdateProfileDto;
import com.pm.expenseservice.dto.request.UpdatePreferencesDto;
import com.pm.expenseservice.dto.response.UserProfileDto;
import com.pm.expenseservice.dto.response.UserPreferencesDto;
import com.pm.expenseservice.entity.User;
import com.pm.expenseservice.entity.UserPreferences;
import com.pm.expenseservice.exception.BadRequestException;
import com.pm.expenseservice.exception.ResourceNotFoundException;
import com.pm.expenseservice.repository.UserPreferencesRepository;
import com.pm.expenseservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final UserSyncService userSyncService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:8084}")
    private String authServiceUrl;

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());

        User updated = userRepository.save(user);

        // Sync with auth-service
        try {
            syncProfileWithAuthService(dto);
        } catch (Exception e) {
            log.warn("Failed to sync profile with auth-service: {}", e.getMessage());
            // Continue even if sync fails - local update is already saved
        }

        log.info("Updated profile for user: {}", userId);

        return mapToProfileDto(updated);
    }

    private void syncProfileWithAuthService(UpdateProfileDto dto) {
        try {
            String url = authServiceUrl + "/api/v1/auth/profile";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(getCurrentUserToken());

            Map<String, String> request = new HashMap<>();
            request.put("firstName", dto.getFirstName());
            request.put("lastName", dto.getLastName());

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully synced profile with auth-service");
            }
        } catch (Exception e) {
            log.error("Failed to sync with auth-service", e);
            throw e;
        }
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordDto dto) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        try {
            String url = authServiceUrl + "/api/v1/auth/change-password";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(getCurrentUserToken());

            Map<String, String> request = new HashMap<>();
            request.put("currentPassword", dto.getCurrentPassword());
            request.put("newPassword", dto.getNewPassword());

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    entity,
                    Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> body = response.getBody();
                String message = body != null ? (String) body.get("message") : "Failed to change password";
                throw new BadRequestException(message);
            }

            log.info("Password changed for user: {}", userId);

        } catch (HttpClientErrorException e) {
            log.error("Error changing password for user: {}", userId, e);

            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new BadRequestException("Current password is incorrect");
            } else if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                try {
                    Map<String, Object> errorBody = e.getResponseBodyAs(Map.class);
                    String message = (String) errorBody.getOrDefault("message", "Failed to change password");
                    throw new BadRequestException(message);
                } catch (Exception ex) {
                    throw new BadRequestException("Failed to change password");
                }
            }

            throw new BadRequestException("Failed to change password: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error changing password for user: {}", userId, e);
            throw new BadRequestException("Failed to change password. Please try again later.");
        }
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 2MB");
        }

        // Generate avatar URL using ui-avatars service
        String encodedFirstName = user.getFirstName().replace(" ", "+");
        String encodedLastName = user.getLastName().replace(" ", "+");
        String avatarUrl = String.format("https://ui-avatars.com/api/?name=%s+%s&background=random&size=200&bold=true",
                encodedFirstName, encodedLastName);

        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        log.info("Avatar uploaded for user: {}", userId);
        return avatarUrl;
    }

    @Transactional
    public void deleteAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAvatarUrl(null);
        userRepository.save(user);

        log.info("Avatar deleted for user: {}", userId);
    }

    @Transactional(readOnly = true)
    public UserPreferencesDto getUserPreferences(Long userId) {
        // Ensure user exists in expense-service
        if (!userRepository.existsById(userId)) {
            // Try to sync user from auth service first
            try {
                syncUserFromAuthService(userId);
            } catch (Exception e) {
                log.error("Failed to sync user from auth service", e);
                throw new ResourceNotFoundException("User not found");
            }
        }

        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return mapToPreferencesDto(preferences);
    }

    @Transactional
    public UserPreferencesDto updatePreferences(Long userId, UpdatePreferencesDto dto) {
        // Ensure user exists in expense-service
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        UserPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        // Update only non-null values
        if (dto.getCurrency() != null) preferences.setCurrency(dto.getCurrency());
        if (dto.getTheme() != null) preferences.setTheme(dto.getTheme());
        if (dto.getLanguage() != null) preferences.setLanguage(dto.getLanguage());
        if (dto.getEmailNotifications() != null) preferences.setEmailNotifications(dto.getEmailNotifications());
        if (dto.getPushNotifications() != null) preferences.setPushNotifications(dto.getPushNotifications());
        if (dto.getMonthlyReports() != null) preferences.setMonthlyReports(dto.getMonthlyReports());
        if (dto.getBudgetAlerts() != null) preferences.setBudgetAlerts(dto.getBudgetAlerts());
        if (dto.getSoundEnabled() != null) preferences.setSoundEnabled(dto.getSoundEnabled());

        UserPreferences updated = preferencesRepository.save(preferences);
        log.info("Updated preferences for user: {}", userId);

        return mapToPreferencesDto(updated);
    }

    private UserPreferences createDefaultPreferences(Long userId) {
        UserPreferences preferences = new UserPreferences();
        preferences.setUserId(userId);
        preferences.setCurrency("USD");
        preferences.setTheme("light");
        preferences.setLanguage("en");
        preferences.setEmailNotifications(true);
        preferences.setPushNotifications(false);
        preferences.setMonthlyReports(true);
        preferences.setBudgetAlerts(true);
        preferences.setSoundEnabled(true);

        return preferencesRepository.save(preferences);
    }

    private UserProfileDto mapToProfileDto(User user) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(formatter) : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().format(formatter) : null)
                .build();
    }

    private UserPreferencesDto mapToPreferencesDto(UserPreferences preferences) {
        return UserPreferencesDto.builder()
                .currency(preferences.getCurrency())
                .theme(preferences.getTheme())
                .language(preferences.getLanguage())
                .emailNotifications(preferences.getEmailNotifications())
                .pushNotifications(preferences.getPushNotifications())
                .monthlyReports(preferences.getMonthlyReports())
                .budgetAlerts(preferences.getBudgetAlerts())
                .soundEnabled(preferences.getSoundEnabled())
                .build();
    }

    /**
     * Helper method to get current user's authentication token
     */
    private String getCurrentUserToken() {
        // Try to get from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() != null) {
            return authentication.getCredentials().toString();
        }

        // Try to get from request header
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes) {
            HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        throw new IllegalStateException("No authentication token found");
    }

    /**
     * Sync user data from auth service
     */
    private void syncUserFromAuthService(Long userId) {
        try {
            String url = authServiceUrl + "/api/v1/auth/profile";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(getCurrentUserToken());

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null) {
                    String email = (String) data.get("email");
                    String firstName = (String) data.get("firstName");
                    String lastName = (String) data.get("lastName");

                    userSyncService.syncUser(userId, email, firstName, lastName);
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync user from auth service", e);
            throw e;
        }
    }
}