package com.pm.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}