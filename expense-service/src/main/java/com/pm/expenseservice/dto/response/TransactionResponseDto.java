package com.pm.expenseservice.dto.response;

import com.pm.expenseservice.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal amount;
    private TransactionType type;
    private String description;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;
}