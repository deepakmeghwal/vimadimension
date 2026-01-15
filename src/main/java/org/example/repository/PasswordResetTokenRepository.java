package org.example.repository;

import org.example.models.PasswordResetToken;
import org.example.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    List<PasswordResetToken> findByUserAndUsedFalse(User user);
    
    Optional<PasswordResetToken> findByUserIdAndUsedFalse(Long userId);
    
    /**
     * Invalidate all pending reset tokens for a user
     */
    @Modifying
    @Query("UPDATE PasswordResetToken prt SET prt.used = true WHERE prt.user.id = :userId AND prt.used = false")
    int invalidatePendingTokens(@Param("userId") Long userId);
    
    /**
     * Delete expired and used tokens (cleanup)
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.expiresAt < :now OR prt.used = true")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
}








