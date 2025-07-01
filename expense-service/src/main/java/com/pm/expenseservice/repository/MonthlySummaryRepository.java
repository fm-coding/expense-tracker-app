package com.pm.expenseservice.repository;

import com.pm.expenseservice.entity.MonthlySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MonthlySummaryRepository extends JpaRepository<MonthlySummary, Long> {

    Optional<MonthlySummary> findByUserIdAndYearAndMonth(Long userId, Integer year, Integer month);
}