package com.pm.expenseservice.dto.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class UserProfileDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String createdAt;
    private String updatedAt;
}