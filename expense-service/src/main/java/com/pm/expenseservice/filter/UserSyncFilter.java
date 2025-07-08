package com.pm.expenseservice.filter;

import com.pm.expenseservice.service.UserSyncService;
import com.pm.expenseservice.util.UserContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserSyncFilter extends OncePerRequestFilter {

    private final UserSyncService userSyncService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            // Check if user is authenticated
            if (UserContext.isAuthenticated()) {
                Long userId = UserContext.getCurrentUserId();
                String email = UserContext.getCurrentUserEmail();

                // For now, skip firstName and lastName if not available
                // The UserSyncService can be modified to work without them
                log.debug("User authenticated - ID: {}, Email: {}", userId, email);

                // You could modify this to only sync with available data
                // Or fetch the full user data from auth-service when needed
            }
        } catch (Exception e) {
            log.error("Error in user sync filter", e);
            // Don't block the request if sync fails
        }

        filterChain.doFilter(request, response);
    }
}