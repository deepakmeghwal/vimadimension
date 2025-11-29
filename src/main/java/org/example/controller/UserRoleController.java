package org.example.controller;

import org.example.dto.UserRolesDTO;
import org.example.models.Role;
import org.example.models.User;
import org.example.repository.RoleRepository;
import org.example.repository.UserRepository;
import org.example.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_HR')") // Admins and HR can manage user roles
public class UserRoleController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionService permissionService;

    /**
     * Get user's roles and permissions
     */
    @GetMapping("/{userId}/roles")
    public ResponseEntity<UserRolesDTO> getUserRoles(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    Set<String> roleNames = user.getRoles().stream()
                            .map(Role::getName)
                            .collect(Collectors.toSet());
                    
                    Set<String> permissions = permissionService.getUserPermissions(user);
                    
                    UserRolesDTO dto = new UserRolesDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            roleNames,
                            permissions
                    );
                    
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update user's roles (replace all roles)
     */
    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Only admins can update roles
    public ResponseEntity<UserRolesDTO> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody List<String> roleNames) {
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Clear existing roles
        user.getRoles().clear();

        // Add new roles
        for (String roleName : roleNames) {
            roleRepository.findByName(roleName).ifPresent(role -> {
                user.getRoles().add(role);
            });
        }

        userRepository.save(user);

        // Return updated user roles
        Set<String> updatedRoleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        
        Set<String> permissions = permissionService.getUserPermissions(user);
        
        UserRolesDTO dto = new UserRolesDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                updatedRoleNames,
                permissions
        );
        
        return ResponseEntity.ok(dto);
    }

    /**
     * Add a single role to user
     */
    @PostMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Only admins can add roles
    public ResponseEntity<UserRolesDTO> addRoleToUser(
            @PathVariable Long userId,
            @RequestBody String roleName) {
        
        User user = userRepository.findById(userId).orElse(null);
        Role role = roleRepository.findByName(roleName).orElse(null);
        
        if (user == null || role == null) {
            return ResponseEntity.notFound().build();
        }

        user.getRoles().add(role);
        userRepository.save(user);

        // Return updated user roles
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        
        Set<String> permissions = permissionService.getUserPermissions(user);
        
        UserRolesDTO dto = new UserRolesDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roleNames,
                permissions
        );
        
        return ResponseEntity.ok(dto);
    }

    /**
     * Remove a role from user
     */
    @DeleteMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Only admins can remove roles
    public ResponseEntity<UserRolesDTO> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable String roleName) {
        
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.getRoles().removeIf(role -> role.getName().equals(roleName));
        userRepository.save(user);

        // Return updated user roles
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        
        Set<String> permissions = permissionService.getUserPermissions(user);
        
        UserRolesDTO dto = new UserRolesDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roleNames,
                permissions
        );
        
        return ResponseEntity.ok(dto);
    }
}
