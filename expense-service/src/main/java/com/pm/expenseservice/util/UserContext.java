package com.pm.expenseservice.util;

import com.pm.expenseservice.security.JwtAuthenticationFilter.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class UserContext {

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            return principal.getUserId();
        }
        throw new IllegalStateException("User ID not found in security context");
    }

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            return principal.getEmail();
        }
        throw new IllegalStateException("User email not found in security context");
    }

    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getPrincipal() instanceof UserPrincipal;
    }
}