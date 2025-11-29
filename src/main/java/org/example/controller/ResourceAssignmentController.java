package org.example.controller;

import org.example.models.ResourceAssignment;
import org.example.service.ResourceAssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for Level 2: Resource Assignment Management
 * Handles phase-level resource planning with billing rates and planned hours
 */
@RestController
@RequestMapping("/api/projects/{projectId}/phases/{phaseId}/resources")
public class ResourceAssignmentController {

    private static final Logger logger = LoggerFactory.getLogger(ResourceAssignmentController.class);

    private final ResourceAssignmentService resourceAssignmentService;

    @Autowired
    public ResourceAssignmentController(ResourceAssignmentService resourceAssignmentService) {
        this.resourceAssignmentService = resourceAssignmentService;
    }

    /**
     * Get all resource assignments for a phase
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getResourceAssignments(@PathVariable Long phaseId) {
        try {
            List<ResourceAssignment> assignments = resourceAssignmentService.getResourceAssignmentsByPhase(phaseId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "assignments", assignments
            ));
        } catch (Exception e) {
            logger.error("Error fetching resource assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch resource assignments"));
        }
    }

    /**
     * Get all resource assignments for a project (across all phases)
     * Note: This endpoint is at project level, not phase level
     */
    @GetMapping("/project")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getResourceAssignmentsByProject(@PathVariable Long projectId, @PathVariable Long phaseId) {
        try {
            List<ResourceAssignment> assignments = resourceAssignmentService.getResourceAssignmentsByProject(projectId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "assignments", assignments
            ));
        } catch (Exception e) {
            logger.error("Error fetching project resource assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch resource assignments"));
        }
    }

    /**
     * Create a new resource assignment
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createResourceAssignment(
            @PathVariable Long phaseId,
            @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            String roleOnPhase = (String) payload.get("roleOnPhase");
            BigDecimal billingRate = payload.get("billingRate") != null 
                ? new BigDecimal(payload.get("billingRate").toString()) : null;
            BigDecimal costRate = payload.get("costRate") != null 
                ? new BigDecimal(payload.get("costRate").toString()) : null;
            Integer plannedHours = payload.get("plannedHours") != null 
                ? Integer.parseInt(payload.get("plannedHours").toString()) : null;
            BigDecimal allocatedPercentage = payload.get("allocatedPercentage") != null 
                ? new BigDecimal(payload.get("allocatedPercentage").toString()) : null;
            LocalDate startDate = payload.get("startDate") != null 
                ? LocalDate.parse(payload.get("startDate").toString()) : null;
            LocalDate endDate = payload.get("endDate") != null 
                ? LocalDate.parse(payload.get("endDate").toString()) : null;

            ResourceAssignment assignment = resourceAssignmentService.createResourceAssignment(
                phaseId, userId, roleOnPhase, billingRate, costRate, 
                plannedHours, allocatedPercentage, startDate, endDate);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "assignment", assignment,
                "message", "Resource assignment created successfully"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating resource assignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create resource assignment"));
        }
    }

    /**
     * Update an existing resource assignment
     */
    @PutMapping("/{assignmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateResourceAssignment(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> payload) {
        try {
            String roleOnPhase = (String) payload.get("roleOnPhase");
            BigDecimal billingRate = payload.get("billingRate") != null 
                ? new BigDecimal(payload.get("billingRate").toString()) : null;
            BigDecimal costRate = payload.get("costRate") != null 
                ? new BigDecimal(payload.get("costRate").toString()) : null;
            Integer plannedHours = payload.get("plannedHours") != null 
                ? Integer.parseInt(payload.get("plannedHours").toString()) : null;
            BigDecimal allocatedPercentage = payload.get("allocatedPercentage") != null 
                ? new BigDecimal(payload.get("allocatedPercentage").toString()) : null;
            LocalDate startDate = payload.get("startDate") != null 
                ? LocalDate.parse(payload.get("startDate").toString()) : null;
            LocalDate endDate = payload.get("endDate") != null 
                ? LocalDate.parse(payload.get("endDate").toString()) : null;

            ResourceAssignment assignment = resourceAssignmentService.updateResourceAssignment(
                assignmentId, roleOnPhase, billingRate, costRate, 
                plannedHours, allocatedPercentage, startDate, endDate);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "assignment", assignment,
                "message", "Resource assignment updated successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating resource assignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update resource assignment"));
        }
    }

    /**
     * Delete a resource assignment
     */
    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteResourceAssignment(@PathVariable Long assignmentId) {
        try {
            resourceAssignmentService.deleteResourceAssignment(assignmentId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Resource assignment deleted successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting resource assignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete resource assignment"));
        }
    }

    /**
     * Get availability and budget info for a user on a phase
     */
    @GetMapping("/users/{userId}/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAssignmentAvailability(@PathVariable Long phaseId, @PathVariable Long userId) {
        try {
            Map<String, Object> availability = resourceAssignmentService.getAssignmentAvailability(phaseId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "availability", availability
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching availability: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch availability"));
        }
    }
}

