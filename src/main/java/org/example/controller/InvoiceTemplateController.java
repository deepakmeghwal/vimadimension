package org.example.controller;

import org.example.models.InvoiceTemplate;
import org.example.service.InvoiceTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoice-templates")
@PreAuthorize("isAuthenticated()")
public class InvoiceTemplateController {

    @Autowired
    private InvoiceTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<InvoiceTemplate>> getAllTemplates(Authentication authentication) {
        // Get templates available for the user's organization
        // For now, return all active templates (can be filtered by org later)
        List<InvoiceTemplate> templates = templateService.getAllActiveTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/default")
    public ResponseEntity<InvoiceTemplate> getDefaultTemplate(Authentication authentication) {
        // Get user's organization ID if available
        Long organizationId = null; // Can be extracted from authentication if needed
        
        return templateService.getDefaultTemplate(organizationId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceTemplate> getTemplateById(@PathVariable Long id) {
        return templateService.getTemplateById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<InvoiceTemplate> createTemplate(@RequestBody InvoiceTemplate template) {
        InvoiceTemplate created = templateService.createTemplate(template);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<InvoiceTemplate> updateTemplate(@PathVariable Long id, @RequestBody InvoiceTemplate template) {
        try {
            InvoiceTemplate updated = templateService.updateTemplate(id, template);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Template deleted successfully"));
    }

    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> initializeDefaultTemplates() {
        templateService.initializeDefaultTemplates();
        return ResponseEntity.ok(Map.of("success", true, "message", "Default templates initialized"));
    }
}






