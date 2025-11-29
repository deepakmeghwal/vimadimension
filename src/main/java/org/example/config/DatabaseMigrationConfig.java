package org.example.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DatabaseMigrationConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationConfig.class);

    @Bean
    public CommandLineRunner dropClientNameColumn(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                logger.info("Attempting to drop 'client_name' column from 'projects' table...");
                jdbcTemplate.execute("ALTER TABLE projects DROP COLUMN client_name");
                logger.info("Successfully dropped 'client_name' column.");
            } catch (Exception e) {
                // Ignore if column doesn't exist or other errors, just log it
                logger.warn("Could not drop 'client_name' column (it might not exist): {}", e.getMessage());
            }
        };
    }
}
