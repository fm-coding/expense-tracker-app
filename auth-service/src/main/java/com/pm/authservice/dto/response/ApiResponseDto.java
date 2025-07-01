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
public class ApiResponseDto {
    @Builder.Default
    private boolean success = true;
    private String message;
    private Object data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}