package org.example.config;

import org.example.models.User;
import org.example.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(4) // Run after other initializers
public class UserCreatedAtBackfill implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(UserCreatedAtBackfill.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void run(org.springframework.boot.ApplicationArguments args) throws Exception {
        try {
            logger.info("Checking for users with missing createdAt...");
            
            // Find all users without createdAt
            List<User> usersWithoutCreatedAt = userRepository.findAll().stream()
                    .filter(user -> user.getCreatedAt() == null)
                    .toList();
            
            if (usersWithoutCreatedAt.isEmpty()) {
                logger.info("All users already have createdAt set.");
                return;
            }
            
            logger.info("Found {} users without createdAt. Backfilling...", usersWithoutCreatedAt.size());
            
            LocalDateTime defaultDate = LocalDateTime.now().minusYears(1); // Default to 1 year ago
            int updated = 0;
            
            for (User user : usersWithoutCreatedAt) {
                user.setCreatedAt(defaultDate);
                userRepository.save(user);
                updated++;
            }
            
            logger.info("Successfully backfilled createdAt for {} users.", updated);
            
        } catch (Exception e) {
            logger.error("Error backfilling createdAt for users: {}", e.getMessage(), e);
            // Don't fail the application startup, just log the error
        }
    }
}



