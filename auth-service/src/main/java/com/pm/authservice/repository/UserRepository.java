package com.pm.authservice.repository;

import com.pm.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    boolean existsByEmailIgnoreCase(String email);

    

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = :attempts, u.lockTime = :lockTime WHERE u.email = :email")
    void updateFailedAttempts(@Param("email") String email,
                              @Param("attempts") int attempts,
                              @Param("lockTime") LocalDateTime lockTime);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.lockTime = null, u.lastLoginAt = :loginTime WHERE u.email = :email")
    void resetFailedAttempts(@Param("email") String email, @Param("loginTime") LocalDateTime loginTime);
}
