package com.pm.expenseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "monthly_summaries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "year", "month"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;

    @Column(name = "total_income", precision = 15, scale = 2)
    private BigDecimal totalIncome = BigDecimal.ZERO;

    @Column(name = "total_expense", precision = 15, scale = 2)
    private BigDecimal totalExpense = BigDecimal.ZERO;

    @Column(name = "net_amount", precision = 15, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @ElementCollection
    @CollectionTable(name = "monthly_category_breakdown",
            joinColumns = @JoinColumn(name = "summary_id"))
    @MapKeyColumn(name = "category_name")
    @Column(name = "amount")
    private Map<String, BigDecimal> categoryBreakdown = new HashMap<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}