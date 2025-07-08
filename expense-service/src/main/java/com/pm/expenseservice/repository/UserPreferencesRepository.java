package com.pm.expenseservice.repository;

import com.pm.expenseservice.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    Optional<UserPreferences> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM UserPreferences up WHERE up.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}