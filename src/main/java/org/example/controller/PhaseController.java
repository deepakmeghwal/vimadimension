package org.example.controller;

import org.example.models.Phase;
import org.example.models.enums.PhaseStatus;
import org.example.service.PhaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/phases")
public class PhaseController {

    private final PhaseService phaseService;

    @Autowired
    public PhaseController(PhaseService phaseService) {
        this.phaseService = phaseService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createPhase(@PathVariable Long projectId, @RequestBody Map<String, Object> payload) {
        try {
            String phaseNumber = (String) payload.get("phaseNumber");
            String name = (String) payload.get("name");
            BigDecimal contractAmount = payload.get("contractAmount") != null ? new BigDecimal(payload.get("contractAmount").toString()) : null;
            String statusStr = (String) payload.get("status");
            PhaseStatus status = statusStr != null ? PhaseStatus.valueOf(statusStr) : PhaseStatus.ACTIVE;

            Phase phase = phaseService.createPhase(projectId, phaseNumber, name, contractAmount, status);
            return ResponseEntity.ok(phase);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Phase>> getPhases(@PathVariable Long projectId) {
        return ResponseEntity.ok(phaseService.getPhasesByProjectId(projectId));
    }

    @PutMapping("/{phaseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updatePhase(@PathVariable Long projectId, @PathVariable Long phaseId, @RequestBody Map<String, Object> payload) {
        try {
            String phaseNumber = (String) payload.get("phaseNumber");
            String name = (String) payload.get("name");
            BigDecimal contractAmount = payload.get("contractAmount") != null ? new BigDecimal(payload.get("contractAmount").toString()) : null;
            String statusStr = (String) payload.get("status");
            PhaseStatus status = statusStr != null ? PhaseStatus.valueOf(statusStr) : null;

            return phaseService.updatePhase(phaseId, phaseNumber, name, contractAmount, status)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{phaseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePhase(@PathVariable Long projectId, @PathVariable Long phaseId) {
        if (phaseService.deletePhase(phaseId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Create standard Indian architectural phases for a project
     * This creates all standard phases based on COA standards
     */
    @PostMapping("/standard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createStandardPhases(@PathVariable Long projectId) {
        try {
            java.util.List<Phase> phases = phaseService.createStandardPhases(projectId);
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Standard phases created successfully",
                "phases", phases,
                "count", phases.size()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Failed to create standard phases: " + e.getMessage()));
        }
    }

    /**
     * Get list of available standard phase types
     */
    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPhaseTypes() {
        org.example.models.enums.PhaseType[] phaseTypes = org.example.models.enums.PhaseType.values();
        java.util.List<java.util.Map<String, Object>> typesList = new java.util.ArrayList<>();
        
        for (org.example.models.enums.PhaseType phaseType : phaseTypes) {
            typesList.add(java.util.Map.of(
                "value", phaseType.name(),
                "label", phaseType.getDisplayName(),
                "sequence", phaseType.getSequence()
            ));
        }
        
        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "types", typesList
        ));
    }
}
