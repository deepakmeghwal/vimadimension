package org.example.service;

import org.example.models.Permission;
import org.example.models.Role;
import org.example.models.User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    /**
     * Check if a user has a specific permission
     * @param user The user to check
     * @param permissionName The permission name (e.g., "users.create")
     * @return true if user has the permission
     */
    public boolean hasPermission(User user, String permissionName) {
        if (user == null || permissionName == null) {
            return false;
        }

        return getUserPermissions(user).contains(permissionName);
    }

    /**
     * Check if a user has any of the specified permissions
     * @param user The user to check
     * @param permissionNames Variable number of permission names
     * @return true if user has at least one of the permissions
     */
    public boolean hasAnyPermission(User user, String... permissionNames) {
        if (user == null || permissionNames == null || permissionNames.length == 0) {
            return false;
        }

        Set<String> userPermissions = getUserPermissions(user);
        for (String permissionName : permissionNames) {
            if (userPermissions.contains(permissionName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a user has all of the specified permissions
     * @param user The user to check
     * @param permissionNames Variable number of permission names
     * @return true if user has all the permissions
     */
    public boolean hasAllPermissions(User user, String... permissionNames) {
        if (user == null || permissionNames == null || permissionNames.length == 0) {
            return false;
        }

        Set<String> userPermissions = getUserPermissions(user);
        for (String permissionName : permissionNames) {
            if (!userPermissions.contains(permissionName)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a user has a specific role
     * @param user The user to check
     * @param roleName The role name (e.g., "ROLE_ADMIN")
     * @return true if user has the role
     */
    public boolean hasRole(User user, String roleName) {
        if (user == null || roleName == null) {
            return false;
        }

        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }

    /**
     * Get all permissions for a user (combined from all their roles)
     * @param user The user
     * @return Set of permission names
     */
    public Set<String> getUserPermissions(User user) {
        if (user == null || user.getRoles() == null) {
            return new HashSet<>();
        }

        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());
    }

    /**
     * Get all role names for a user
     * @param user The user
     * @return Set of role names
     */
    public Set<String> getUserRoles(User user) {
        if (user == null || user.getRoles() == null) {
            return new HashSet<>();
        }

        return user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    /**
     * Check if a user is an admin
     * @param user The user
     * @return true if user has ROLE_ADMIN
     */
    public boolean isAdmin(User user) {
        return hasRole(user, "ROLE_ADMIN");
    }

    /**
     * Check if a user is HR
     * @param user The user
     * @return true if user has ROLE_HR
     */
    public boolean isHR(User user) {
        return hasRole(user, "ROLE_HR");
    }

    /**
     * Check if a user is a manager
     * @param user The user
     * @return true if user has ROLE_MANAGER
     */
    public boolean isManager(User user) {
        return hasRole(user, "ROLE_MANAGER");
    }
}
