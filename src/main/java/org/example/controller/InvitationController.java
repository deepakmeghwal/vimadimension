package org.example.controller;

import org.example.dto.auth.AcceptInvitationRequest;
import org.example.dto.auth.InviteEmployeeRequest;
import org.example.models.InvitationToken;
import org.example.models.User;
import org.example.service.AuthService;
import org.example.service.AuthService.AcceptInvitationResult;
import org.example.service.AuthService.InvitationDetails;
import org.example.service.AuthService.InvitationResult;
import org.example.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for employee invitation management.
 * 
 * Endpoints:
 * - POST /api/invitations/send - Send invitation (Admin only)
 * - GET /api/invitations/validate - Validate invitation token (Public)
 * - POST /api/invitations/accept - Accept invitation and create account (Public)
 * - GET /api/invitations/pending - Get pending invitations (Admin only)
 * - DELETE /api/invitations/{token} - Cancel invitation (Admin only)
 */
@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private static final Logger logger = LoggerFactory.getLogger(InvitationController.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    /**
     * Send an invitation to an employee.
     * Only admins and HR can send invitations.
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> sendInvitation(
            @Valid @RequestBody InviteEmployeeRequest request,
            BindingResult bindingResult,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();

        // Handle validation errors
        if (bindingResult.hasErrors()) {
            response.put("success", false);
            response.put("message", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Get current user
            User inviter = userService.findByUsernameWithOrganization(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            InvitationResult result = authService.inviteEmployee(
                    inviter,
                    request.getEmail(),
                    request.getRoleName()
            );

            if (result.success()) {
                response.put("success", true);
                response.put("message", result.message());
                response.put("email", result.email());
                logger.info("Invitation sent to {} by {}", result.email(), inviter.getUsername());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", result.message());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Failed to send invitation: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to send invitation: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Validate an invitation token.
     * Public endpoint - used by the frontend to show invitation details.
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateInvitation(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();

        if (token == null || token.trim().isEmpty()) {
            response.put("valid", false);
            response.put("message", "Invitation token is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            InvitationDetails details = authService.validateInvitation(token);

            if (details.valid()) {
                response.put("valid", true);
                response.put("email", details.email());
                response.put("organizationName", details.organizationName());
                response.put("organizationId", details.organizationId());
                response.put("roleName", details.roleName());
                return ResponseEntity.ok(response);
            } else {
                response.put("valid", false);
                response.put("message", details.message());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Failed to validate invitation: {}", e.getMessage(), e);
            response.put("valid", false);
            response.put("message", "Failed to validate invitation");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Accept an invitation and create a user account.
     * Public endpoint - user provides their name, username, and password.
     */
    @PostMapping("/accept")
    public ResponseEntity<Map<String, Object>> acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request,
            BindingResult bindingResult) {
        
        Map<String, Object> response = new HashMap<>();

        // Handle validation errors
        if (bindingResult.hasErrors()) {
            response.put("success", false);
            response.put("message", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            AcceptInvitationResult result = authService.acceptInvitation(
                    request.getToken(),
                    request.getName(),
                    request.getUsername(),
                    request.getPassword()
            );

            if (result.success()) {
                response.put("success", true);
                response.put("message", result.message());
                response.put("userId", result.userId());
                response.put("username", result.username());
                logger.info("Invitation accepted by {}", result.username());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", result.message());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Failed to accept invitation: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to accept invitation: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get all pending invitations for the current user's organization.
     * Admin and HR endpoint.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getPendingInvitations(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            User currentUser = userService.findByUsernameWithOrganization(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (currentUser.getOrganization() == null) {
                response.put("success", false);
                response.put("message", "You must belong to an organization");
                return ResponseEntity.badRequest().body(response);
            }

            List<InvitationToken> pendingInvitations = 
                    authService.getPendingInvitations(currentUser.getOrganization().getId());

            List<Map<String, Object>> invitationList = pendingInvitations.stream()
                    .filter(inv -> !inv.isExpired()) // Only show non-expired
                    .map(inv -> {
                        Map<String, Object> invMap = new HashMap<>();
                        invMap.put("token", inv.getToken());
                        invMap.put("email", inv.getEmail());
                        invMap.put("roleName", inv.getRoleName());
                        invMap.put("invitedBy", inv.getInvitedBy().getName());
                        invMap.put("createdAt", inv.getCreatedAt().format(DATE_FORMATTER));
                        invMap.put("expiresAt", inv.getExpiresAt().format(DATE_FORMATTER));
                        return invMap;
                    })
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("invitations", invitationList);
            response.put("count", invitationList.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get pending invitations: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to get pending invitations");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cancel a pending invitation.
     * Admin and HR endpoint.
     */
    @DeleteMapping("/{token}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> cancelInvitation(
            @PathVariable String token,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();

        try {
            User currentUser = userService.findByUsernameWithOrganization(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean cancelled = authService.cancelInvitation(token, currentUser);

            if (cancelled) {
                response.put("success", true);
                response.put("message", "Invitation cancelled successfully");
                logger.info("Invitation {} cancelled by {}", token, currentUser.getUsername());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invitation not found or already used");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Failed to cancel invitation: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to cancel invitation");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Bulk invite multiple employees.
     * Admin and HR endpoint.
     */
    @PostMapping("/send-bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> sendBulkInvitations(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();

        try {
            User inviter = userService.findByUsernameWithOrganization(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            @SuppressWarnings("unchecked")
            List<String> emails = (List<String>) request.get("emails");
            String roleName = (String) request.getOrDefault("roleName", "ROLE_EMPLOYEE");

            if (emails == null || emails.isEmpty()) {
                response.put("success", false);
                response.put("message", "At least one email is required");
                return ResponseEntity.badRequest().body(response);
            }

            int successCount = 0;
            int failCount = 0;
            List<Map<String, String>> results = emails.stream()
                    .map(email -> {
                        Map<String, String> result = new HashMap<>();
                        result.put("email", email);
                        try {
                            InvitationResult invResult = authService.inviteEmployee(inviter, email, roleName);
                            result.put("success", String.valueOf(invResult.success()));
                            result.put("message", invResult.message());
                        } catch (Exception e) {
                            result.put("success", "false");
                            result.put("message", e.getMessage());
                        }
                        return result;
                    })
                    .collect(Collectors.toList());

            successCount = (int) results.stream().filter(r -> "true".equals(r.get("success"))).count();
            failCount = results.size() - successCount;

            response.put("success", true);
            response.put("results", results);
            response.put("successCount", successCount);
            response.put("failCount", failCount);
            response.put("message", String.format("Sent %d of %d invitations successfully", successCount, emails.size()));
            
            logger.info("Bulk invitations sent by {}: {} success, {} failed", 
                    inviter.getUsername(), successCount, failCount);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to send bulk invitations: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to send invitations: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

