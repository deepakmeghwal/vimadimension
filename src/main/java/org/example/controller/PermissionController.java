package org.example.controller;

import org.example.models.Permission;
import org.example.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/permissions")
@PreAuthorize("hasRole('ROLE_ADMIN')") // Only admins can view permissions
public class PermissionController {

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Get all permissions
     */
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return ResponseEntity.ok(permissions);
    }

    /**
     * Get permissions grouped by resource
     */
    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<Permission>>> getPermissionsGrouped() {
        List<Permission> permissions = permissionRepository.findAll();
        
        Map<String, List<Permission>> grouped = permissions.stream()
                .collect(Collectors.groupingBy(Permission::getResource));
        
        return ResponseEntity.ok(grouped);
    }

    /**
     * Get permission by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long id) {
        return permissionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
