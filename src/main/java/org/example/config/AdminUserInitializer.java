package org.example.config;

import org.example.models.Role;
import org.example.models.User;
import org.example.repository.RoleRepository;
import org.example.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;

@Component
@Order(2)
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Checking for default admin user...");

        // Check for "admin" user
        createAdminUserIfNotFound("admin", "admin", "admin@vimadimension.com", "System Administrator");
        
        // Check for "kejriwal9576" user
        createAdminUserIfNotFound("kejriwal9576", "admin", "kejriwal9576@vimadimension.com", "Saurav Kejriwal");
    }

    private void createAdminUserIfNotFound(String username, String password, String email, String fullName) {
        if (userRepository.findByUsername(username).isEmpty()) {
            logger.info("User {} not found. Creating...", username);
            
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(fullName);
            user.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            user.setEnabled(true);

            userRepository.save(user);
            logger.info("User {} created successfully.", username);
        } else {
            logger.info("User {} already exists. Ensuring ROLE_ADMIN...", username);
            User user = userRepository.findByUsername(username).get();
            boolean hasAdminRole = user.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
            
            if (!hasAdminRole) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                user.getRoles().add(adminRole);
                userRepository.save(user);
                logger.info("Added ROLE_ADMIN to existing user {}.", username);
            } else {
                logger.info("User {} already has ROLE_ADMIN.", username);
            }
        }
    }
}
