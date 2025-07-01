package com.pm.authservice.security;


import com.pm.authservice.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPassword(),
                user.getIsEnabled(),
                user.getIsAccountNonExpired(),
                isAccountNonLocked(user),
                user.getIsCredentialsNonExpired()
        );
    }

    private static boolean isAccountNonLocked(User user) {
        if (user.getLockTime() == null) {
            return user.getIsAccountNonLocked();
        }

        // Account is locked for 30 minutes after 5 failed attempts
        LocalDateTime unlockTime = user.getLockTime().plusMinutes(30);
        return LocalDateTime.now().isAfter(unlockTime);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // No roles required as per requirements
        return Collections.emptyList();
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
