package org.example.controller;

import org.example.dto.auth.OrganizationRegistrationRequest;
import org.example.service.AuthService;
import org.example.service.AuthService.OrganizationRegistrationResult;
import org.example.service.AuthService.VerificationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for organization registration and email verification.
 * 
 * Endpoints:
 * - POST /api/organization/register - Register a new organization (sends verification email)
 * - GET /api/organization/verify - Verify email using token
 * - POST /api/organization/resend-verification - Resend verification email
 */
@RestController
@RequestMapping("/api/organization")
public class OrganizationRegistrationController {

    private static final Logger logger = LoggerFactory.getLogger(OrganizationRegistrationController.class);

    @Autowired
    private AuthService authService;

    /**
     * Register a new organization with an admin user.
     * Creates an unverified organization and sends a verification email.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerOrganization(
            @Valid @RequestBody OrganizationRegistrationRequest request,
            BindingResult bindingResult) {
        
        Map<String, Object> response = new HashMap<>();

        // Handle validation errors
        if (bindingResult.hasErrors()) {
            response.put("success", false);
            response.put("message", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            OrganizationRegistrationResult result = authService.registerOrganization(
                    request.getOrganizationName(),
                    request.getOrganizationDescription(),
                    request.getOrganizationEmail(),
                    request.getOrganizationPhone(),
                    request.getOrganizationAddress(),
                    request.getOrganizationWebsite(),
                    request.getAdminName(),
                    request.getAdminUsername(),
                    request.getAdminEmail(),
                    request.getAdminPassword(),
                    request.getAdminDesignation(),
                    request.getAdminSpecialization()
            );

            if (result.success()) {
                response.put("success", true);
                response.put("message", result.message());
                response.put("organizationId", result.organizationId());
                response.put("requiresVerification", true);
                logger.info("Organization registered successfully: {}", request.getOrganizationName());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", result.message());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Verify organization email using the token from the verification email.
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();

        if (token == null || token.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Verification token is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            VerificationResult result = authService.verifyOrganization(token);

            if (result.success()) {
                response.put("success", true);
                response.put("message", result.message());
                response.put("organizationId", result.organizationId());
                response.put("organizationName", result.organizationName());
                logger.info("Organization verified successfully: {}", result.organizationName());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", result.message());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            logger.error("Verification failed: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Verification failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Resend verification email.
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, Object>> resendVerification(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Always return success to prevent email enumeration
            authService.resendVerificationEmail(email);
            
            response.put("success", true);
            response.put("message", "If an unverified account exists with this email, a new verification link has been sent.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Resend verification failed: {}", e.getMessage(), e);
            response.put("success", true); // Still return success to prevent enumeration
            response.put("message", "If an unverified account exists with this email, a new verification link has been sent.");
            return ResponseEntity.ok(response);
        }
    }
}
