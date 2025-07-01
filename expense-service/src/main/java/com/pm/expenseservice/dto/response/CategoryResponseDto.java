package com.pm.expenseservice.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDto {
    private Long id;
    private String name;
    private String type;
    private String icon;
    private String color;
    private Boolean isSystem;
}