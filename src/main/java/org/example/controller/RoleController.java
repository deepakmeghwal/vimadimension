package org.example.controller;

import org.example.dto.RoleDTO;
import org.example.models.Permission;
import org.example.models.Role;
import org.example.repository.PermissionRepository;
import org.example.repository.RoleRepository;
import org.example.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.example.models.User;
import org.example.service.UserService;
import org.springframework.security.core.Authentication;

// ... imports ...

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ROLE_ADMIN')") // Only admins can manage roles
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private UserService userService;

    /**
     * Get all roles
     */
    @GetMapping
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<RoleDTO>> getAllRoles(Authentication authentication) {
        // Get current admin user to determine organization
        String adminUsername = authentication.getName();
        User adminUser = userService.findByUsername(adminUsername)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long organizationId = adminUser.getOrganization() != null ? adminUser.getOrganization().getId() : null;

        List<Role> roles = roleRepository.findAll();
        // Initialize the users collection for each role within the transaction
        roles.forEach(role -> {
            if (role.getUsers() != null) {
                role.getUsers().size(); // Force initialization
            }
        });
        List<RoleDTO> roleDTOs = roles.stream()
                .map(role -> convertToDTO(role, organizationId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDTOs);
    }

    /**
     * Get a single role by ID
     */
    @GetMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id, Authentication authentication) {
        // Get current admin user to determine organization
        String adminUsername = authentication.getName();
        User adminUser = userService.findByUsername(adminUsername)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Long organizationId = adminUser.getOrganization() != null ? adminUser.getOrganization().getId() : null;

        return roleRepository.findById(id)
                .map(role -> ResponseEntity.ok(convertToDTO(role, organizationId)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ... existing methods ...

    /**
     * Convert Role entity to DTO with organization-scoped user count
     */
    private RoleDTO convertToDTO(Role role, Long organizationId) {
        // Calculate user count for this role within the organization
        long userCount = 0;
        if (role.getUsers() != null) {
            if (organizationId != null) {
                userCount = role.getUsers().stream()
                    .filter(user -> user.getOrganization() != null && 
                                  user.getOrganization().getId().equals(organizationId))
                    .count();
            } else {
                // If no organization (e.g., system admin), show all users
                userCount = role.getUsers().size();
            }
        }

        return new RoleDTO(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getPermissionNames(),
                (int) userCount
        );
    }
    
    private RoleDTO convertToDTO(Role role) {
        return convertToDTO(role, null);
    }
}
