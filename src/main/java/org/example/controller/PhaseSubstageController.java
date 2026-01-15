package org.example.controller;

import org.example.models.Phase;
import org.example.models.PhaseSubstage;
import org.example.service.PhaseService;
import org.example.service.PhaseSubstageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Phase Substages API.
 * Manages deliverables/tasks within project phases.
 */
@RestController
@RequestMapping("/api/phases/{phaseId}/substages")
public class PhaseSubstageController {

    private final PhaseSubstageService substageService;
    private final PhaseService phaseService;

    @Autowired
    public PhaseSubstageController(PhaseSubstageService substageService, PhaseService phaseService) {
        this.substageService = substageService;
        this.phaseService = phaseService;
    }

    /**
     * Get all substages for a phase.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<?> getSubstages(@PathVariable Long phaseId) {
        try {
            List<PhaseSubstage> substages = substageService.getSubstagesByPhaseId(phaseId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("substages", substages);
            response.put("completionStatus", substageService.getCompletionStatus(phaseId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Create default substages for a phase.
     */
    @PostMapping("/create-defaults")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createDefaultSubstages(@PathVariable Long phaseId) {
        try {
            Phase phase = phaseService.getPhaseById(phaseId)
                    .orElseThrow(() -> new IllegalArgumentException("Phase not found: " + phaseId));
            
            // Check if substages already exist
            List<PhaseSubstage> existing = substageService.getSubstagesByPhaseId(phaseId);
            if (!existing.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Substages already exist for this phase");
                response.put("substages", existing);
                return ResponseEntity.badRequest().body(response);
            }
            
            List<PhaseSubstage> created = substageService.createDefaultSubstages(phase);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Created " + created.size() + " substages");
            response.put("substages", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update substage completion status (unified endpoint).
     * @param completed true to mark complete, false to mark incomplete
     */
    @PatchMapping("/{substageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<?> updateSubstageStatus(
            @PathVariable Long phaseId,
            @PathVariable Long substageId,
            @RequestBody Map<String, Object> body) {
        try {
            Boolean completed = (Boolean) body.get("completed");
            if (completed == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "'completed' field is required (true or false)");
                return ResponseEntity.badRequest().body(error);
            }

            PhaseSubstage substage;
            if (completed) {
                substage = substageService.markComplete(substageId);
            } else {
                substage = substageService.markIncomplete(substageId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("substage", substage);
            response.put("completionStatus", substageService.getCompletionStatus(phaseId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * @deprecated Use PATCH /api/phases/{phaseId}/substages/{substageId} with {"completed": true} instead
     */
    @Deprecated
    @PutMapping("/{substageId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<?> markComplete(@PathVariable Long phaseId, @PathVariable Long substageId) {
        try {
            PhaseSubstage substage = substageService.markComplete(substageId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("substage", substage);
            response.put("completionStatus", substageService.getCompletionStatus(phaseId));
            response.put("deprecationWarning", "This endpoint is deprecated. Use PATCH /api/phases/{phaseId}/substages/{substageId} with body {\"completed\": true}");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * @deprecated Use PATCH /api/phases/{phaseId}/substages/{substageId} with {"completed": false} instead
     */
    @Deprecated
    @PutMapping("/{substageId}/incomplete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<?> markIncomplete(@PathVariable Long phaseId, @PathVariable Long substageId) {
        try {
            PhaseSubstage substage = substageService.markIncomplete(substageId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("substage", substage);
            response.put("completionStatus", substageService.getCompletionStatus(phaseId));
            response.put("deprecationWarning", "This endpoint is deprecated. Use PATCH /api/phases/{phaseId}/substages/{substageId} with body {\"completed\": false}");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get completion status for a phase.
     */
    @GetMapping("/completion-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<?> getCompletionStatus(@PathVariable Long phaseId) {
        try {
            Map<String, Object> status = substageService.getCompletionStatus(phaseId);
            status.put("success", true);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Check if all substages are complete (for invoice generation).
     */
    @GetMapping("/can-invoice")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> canGenerateInvoice(@PathVariable Long phaseId) {
        try {
            boolean canInvoice = substageService.areAllSubstagesComplete(phaseId);
            Map<String, Object> status = substageService.getCompletionStatus(phaseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("canInvoice", canInvoice);
            response.put("completionStatus", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
