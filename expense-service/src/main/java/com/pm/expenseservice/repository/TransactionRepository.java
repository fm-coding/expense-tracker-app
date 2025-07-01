package com.pm.expenseservice.repository;

import com.pm.expenseservice.entity.Transaction;
import com.pm.expenseservice.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
            "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
            "AND (:endDate IS NULL OR t.transactionDate <= :endDate)")
    Page<Transaction> findUserTransactionsWithFilters(@Param("userId") Long userId,
                                                      @Param("type") TransactionType type,
                                                      @Param("categoryId") Long categoryId,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate,
                                                      Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.userId = :userId AND t.type = :type " +
            "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumByUserAndTypeAndDateRange(@Param("userId") Long userId,
                                            @Param("type") TransactionType type,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category.id as categoryId, t.category.name as categoryName, " +
            "t.category.icon as categoryIcon, t.category.color as categoryColor, " +
            "SUM(t.amount) as total FROM Transaction t " +
            "WHERE t.userId = :userId AND t.type = :type " +
            "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate " +
            "GROUP BY t.category.id, t.category.name, t.category.icon, t.category.color " +
            "ORDER BY total DESC")
    List<CategorySummaryProjection> sumByCategory(@Param("userId") Long userId,
                                                  @Param("type") TransactionType type,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    List<Transaction> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    // Alternative 1: Using native query for PostgreSQL
    @Query(value = "SELECT EXTRACT(YEAR FROM t.transaction_date) as year, " +
            "EXTRACT(MONTH FROM t.transaction_date) as month, " +
            "t.type as type, SUM(t.amount) as total " +
            "FROM transactions t " +
            "WHERE t.user_id = :userId AND t.transaction_date >= :startDate " +
            "GROUP BY EXTRACT(YEAR FROM t.transaction_date), EXTRACT(MONTH FROM t.transaction_date), t.type " +
            "ORDER BY year DESC, month DESC", nativeQuery = true)
    List<MonthlyTrendProjection> getMonthlyTrends(@Param("userId") Long userId,
                                                  @Param("startDate") LocalDate startDate);

    // Additional method for getting transactions by date range and type
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
            "AND t.type = :type " +
            "AND t.transactionDate >= :startDate " +
            "AND t.transactionDate <= :endDate " +
            "ORDER BY t.transactionDate ASC")
    List<Transaction> findByUserIdAndTypeAndDateRange(@Param("userId") Long userId,
                                                      @Param("type") TransactionType type,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate);

    interface CategorySummaryProjection {
        Long getCategoryId();
        String getCategoryName();
        String getCategoryIcon();
        String getCategoryColor();
        BigDecimal getTotal();
    }

    interface MonthlyTrendProjection {
        Integer getYear();
        Integer getMonth();
        TransactionType getType();
        BigDecimal getTotal();
    }
}