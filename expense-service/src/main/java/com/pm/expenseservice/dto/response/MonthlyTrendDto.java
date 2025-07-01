package com.pm.expenseservice.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    private Integer year;
    private Integer month;
    private String monthName;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal net;
}