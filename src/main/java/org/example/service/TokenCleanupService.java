package org.example.service;

import org.example.repository.InvitationTokenRepository;
import org.example.repository.PasswordResetTokenRepository;
import org.example.repository.VerificationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for cleaning up expired tokens.
 * Runs periodically to remove old verification, invitation, and password reset tokens.
 */
@Service
public class TokenCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupService.class);

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private InvitationTokenRepository invitationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    /**
     * Clean up expired and used tokens.
     * Runs every 6 hours.
     */
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000) // 6 hours in milliseconds
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        
        try {
            int verificationDeleted = verificationTokenRepository.deleteExpiredTokens(now);
            int invitationDeleted = invitationTokenRepository.deleteExpiredTokens(now);
            int resetDeleted = passwordResetTokenRepository.deleteExpiredTokens(now);
            
            if (verificationDeleted > 0 || invitationDeleted > 0 || resetDeleted > 0) {
                logger.info("Token cleanup completed: {} verification, {} invitation, {} reset tokens deleted",
                        verificationDeleted, invitationDeleted, resetDeleted);
            }
        } catch (Exception e) {
            logger.error("Failed to cleanup tokens: {}", e.getMessage(), e);
        }
    }
}








