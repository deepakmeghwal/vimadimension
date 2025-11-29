package org.example.repository;

import org.example.models.Organization;
import org.example.models.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    
    Optional<VerificationToken> findByToken(String token);
    
    Optional<VerificationToken> findByOrganization(Organization organization);
    
    Optional<VerificationToken> findByOrganizationId(Long organizationId);
    
    boolean existsByOrganizationIdAndUsedFalse(Long organizationId);
    
    /**
     * Delete expired and used tokens (cleanup)
     */
    @Modifying
    @Query("DELETE FROM VerificationToken vt WHERE vt.expiresAt < :now OR vt.used = true")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
}







