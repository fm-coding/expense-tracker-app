package com.pm.expenseservice.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netAmount;
    private BigDecimal savingsRate;
    private List<CategorySummaryDto> expensesByCategory;
    private List<CategorySummaryDto> incomeBySource;
    private List<TransactionResponseDto> recentTransactions;
    private List<MonthlyTrendDto> monthlyTrends;
}