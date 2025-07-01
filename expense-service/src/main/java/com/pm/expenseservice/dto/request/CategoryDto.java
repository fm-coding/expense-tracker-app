package com.pm.expenseservice.dto.request;

import com.pm.expenseservice.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name cannot exceed 100 characters")
    private String name;

    @NotNull(message = "Category type is required")
    private TransactionType type;

    @Size(max = 50, message = "Icon name cannot exceed 50 characters")
    private String icon;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color format. Use hex color (e.g., #FF5733)")
    private String color;
}