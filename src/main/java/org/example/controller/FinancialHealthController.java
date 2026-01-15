package org.example.controller;

import org.example.dto.FinancialHealthDto;
import org.example.models.User;
import org.example.service.FinancialHealthService;
import org.example.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/financial-health")
@CrossOrigin(origins = "http://localhost:3000")
public class FinancialHealthController {

    private static final Logger logger = LoggerFactory.getLogger(FinancialHealthController.class);

    private final FinancialHealthService financialHealthService;
    private final UserService userService;

    @Autowired
    public FinancialHealthController(FinancialHealthService financialHealthService, UserService userService) {
        this.financialHealthService = financialHealthService;
        this.userService = userService;
    }

    /**
     * Get financial health dashboard data for the authenticated user's organization.
     * Requires ADMIN or MANAGER role.
     * 
     * @param authentication Spring Security authentication object
     * @return Financial health dashboard data
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<?> getFinancialHealthDashboard(Authentication authentication) {
        try {
            // Get the current user to determine their organization
            String username = authentication.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
            
            if (user.getOrganization() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User must belong to an organization"
                ));
            }
            
            Long organizationId = user.getOrganization().getId();
            FinancialHealthDto dashboardData = financialHealthService.getFinancialHealth(organizationId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboardData,
                "message", "Financial health dashboard data retrieved successfully"
            ));
        } catch (IllegalArgumentException e) {
            logger.error("Error getting financial health dashboard: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error getting financial health dashboard: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to retrieve financial health dashboard data"
            ));
        }
    }

    /**
     * Get financial health dashboard data for a specific organization.
     * This endpoint is for system admins to view any organization's financial health.
     * 
     * @param organizationId The organization ID
     * @param authentication Spring Security authentication object
     * @return Financial health dashboard data
     */
    @GetMapping("/dashboard/organization/{organizationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getFinancialHealthDashboardByOrganization(
            @PathVariable Long organizationId,
            Authentication authentication) {
        try {
            FinancialHealthDto dashboardData = financialHealthService.getFinancialHealth(organizationId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboardData,
                "message", "Financial health dashboard data retrieved successfully"
            ));
        } catch (IllegalArgumentException e) {
            logger.error("Error getting financial health dashboard for organization {}: {}", 
                    organizationId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error getting financial health dashboard for organization {}: {}", 
                    organizationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to retrieve financial health dashboard data"
            ));
        }
    }
}






