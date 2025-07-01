package com.pm.expenseservice.service;

import com.pm.expenseservice.dto.response.*;
import com.pm.expenseservice.enums.TransactionType;
import com.pm.expenseservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboard(Long userId, int year, int month) {
        log.info("Generating dashboard for user: {} for {}/{}", userId, month, year);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // Get totals
        BigDecimal totalIncome = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumByUserAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);
        BigDecimal netAmount = totalIncome.subtract(totalExpense);

        // Calculate savings rate
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netAmount.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Get category summaries
        List<CategorySummaryDto> expensesByCategory = getCategorySummaries(
                userId, TransactionType.EXPENSE, startDate, endDate, totalExpense);
        List<CategorySummaryDto> incomeBySource = getCategorySummaries(
                userId, TransactionType.INCOME, startDate, endDate, totalIncome);

        // Get recent transactions
        List<TransactionResponseDto> recentTransactions = transactionRepository
                .findTop10ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(transaction -> transactionService.mapToResponseDto(transaction))
                .collect(Collectors.toList());

        // Get monthly trends (last 6 months)
        List<MonthlyTrendDto> monthlyTrends = getMonthlyTrends(userId, 6);

        return DashboardResponseDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .savingsRate(savingsRate)
                .expensesByCategory(expensesByCategory)
                .incomeBySource(incomeBySource)
                .recentTransactions(recentTransactions)
                .monthlyTrends(monthlyTrends)
                .build();
    }

    private List<CategorySummaryDto> getCategorySummaries(Long userId, TransactionType type,
                                                          LocalDate startDate, LocalDate endDate,
                                                          BigDecimal total) {
        return transactionRepository.sumByCategory(userId, type, startDate, endDate)
                .stream()
                .map(projection -> {
                    BigDecimal percentage = BigDecimal.ZERO;
                    if (total.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = projection.getTotal()
                                .divide(total, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));
                    }

                    return CategorySummaryDto.builder()
                            .categoryId(projection.getCategoryId())
                            .categoryName(projection.getCategoryName())
                            .categoryIcon(projection.getCategoryIcon())
                            .categoryColor(projection.getCategoryColor())
                            .amount(projection.getTotal())
                            .percentage(percentage.doubleValue())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<MonthlyTrendDto> getMonthlyTrends(Long userId, int months) {
        LocalDate startDate = LocalDate.now().minusMonths(months - 1).withDayOfMonth(1);

        Map<String, MonthlyTrendDto> trendsMap = new LinkedHashMap<>();

        // Initialize all months
        for (int i = 0; i < months; i++) {
            LocalDate date = startDate.plusMonths(i);
            String key = date.getYear() + "-" + date.getMonthValue();
            trendsMap.put(key, MonthlyTrendDto.builder()
                    .year(date.getYear())
                    .month(date.getMonthValue())
                    .monthName(date.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .income(BigDecimal.ZERO)
                    .expense(BigDecimal.ZERO)
                    .net(BigDecimal.ZERO)
                    .build());
        }

        // Get data from database
        transactionRepository.getMonthlyTrends(userId, startDate)
                .forEach(projection -> {
                    String key = projection.getYear() + "-" + projection.getMonth();
                    MonthlyTrendDto trend = trendsMap.get(key);
                    if (trend != null) {
                        if (projection.getType() == TransactionType.INCOME) {
                            trend.setIncome(projection.getTotal());
                        } else {
                            trend.setExpense(projection.getTotal());
                        }
                        trend.setNet(trend.getIncome().subtract(trend.getExpense()));
                    }
                });

        return new ArrayList<>(trendsMap.values());
    }
}