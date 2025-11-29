package org.example.controller;

import org.example.models.AuditLog;
import org.example.models.User;
import org.example.service.AuditService;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("isAuthenticated()")
public class AuditController {

    private final AuditService auditService;
    private final UserRepository userRepository;

    @Autowired
    public AuditController(AuditService auditService, UserRepository userRepository) {
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@PathVariable String entityType, @PathVariable Long entityId) {
        // Security check should be added here to ensure user can view these logs
        return ResponseEntity.ok(auditService.getAuditLogs(entityType.toUpperCase(), entityId));
    }

    @GetMapping("/organization")
    public ResponseEntity<List<AuditLog>> getOrganizationAuditLogs(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        if (user.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(auditService.getOrganizationAuditLogs(user.getOrganization().getId()));
    }
}

