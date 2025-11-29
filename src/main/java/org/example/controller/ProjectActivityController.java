package org.example.controller;

import org.example.dto.ProjectActivityDto;
import org.example.models.ProjectActivity;
import org.example.models.enums.ActivityType;
import org.example.service.ProjectActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectActivityController {

    @Autowired
    private ProjectActivityService projectActivityService;

    @GetMapping("/{projectId}/activities")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProjectActivities(@PathVariable Long projectId) {
        List<ProjectActivityDto> activities = projectActivityService.getRecentActivitiesByProjectId(projectId);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/{projectId}/activities")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createActivity(@PathVariable Long projectId, @RequestBody Map<String, String> payload, Authentication authentication) {
        String typeStr = payload.get("type");
        String description = payload.get("description");
        
        if (typeStr == null || description == null) {
            return ResponseEntity.badRequest().body("Type and description are required");
        }

        try {
            ActivityType type = ActivityType.valueOf(typeStr);
            ProjectActivity activity = projectActivityService.createActivity(projectId, authentication.getName(), type, description);
            // Return simplified DTO for consistency
            ProjectActivityDto dto = ProjectActivityDto.fromEntity(activity);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
