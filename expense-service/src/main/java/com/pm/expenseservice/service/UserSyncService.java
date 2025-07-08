package com.pm.expenseservice.service;

import com.pm.expenseservice.entity.User;
import com.pm.expenseservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSyncService {

    private final UserRepository userRepository;

    @Transactional
    public User syncUser(Long userId, String email, String firstName, String lastName) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            // Create new user
            user = User.builder()
                    .id(userId)
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .isActive(true)
                    .build();

            log.info("Creating new user in expense-service: {}", email);
        } else {
            // Update existing user
            boolean hasChanges = false;

            if (!email.equals(user.getEmail())) {
                user.setEmail(email);
                hasChanges = true;
            }

            if (!firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                hasChanges = true;
            }

            if (!lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                hasChanges = true;
            }

            if (hasChanges) {
                log.info("Updating user in expense-service: {}", email);
            }
        }

        return userRepository.save(user);
    }
}