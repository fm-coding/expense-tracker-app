package com.pm.expenseservice.repository;

import com.pm.expenseservice.entity.Category;
import com.pm.expenseservice.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.isSystem = true OR c.userId = :userId")
    List<Category> findAllForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Category c WHERE c.type = :type AND (c.isSystem = true OR c.userId = :userId)")
    List<Category> findByTypeForUser(@Param("type") TransactionType type, @Param("userId") Long userId);

    Optional<Category> findByNameAndTypeAndUserId(String name, TransactionType type, Long userId);

    Optional<Category> findByNameAndTypeAndIsSystemTrue(String name, TransactionType type);

    boolean existsByNameAndTypeAndUserId(String name, TransactionType type, Long userId);
}