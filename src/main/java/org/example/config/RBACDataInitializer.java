package org.example.config;

import org.example.models.Permission;
import org.example.models.Role;
import org.example.repository.PermissionRepository;
import org.example.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@Order(1)
public class RBACDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(RBACDataInitializer.class);

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Initializing RBAC data (Roles and Permissions)...");

        // Create Permissions
        createPermissionsIfNotExist();

        // Create Roles with Permissions
        createRolesIfNotExist();

        logger.info("RBAC data initialization complete.");
    }

    private void createPermissionsIfNotExist() {
        List<Permission> permissions = Arrays.asList(
            // User permissions
            new Permission("users.view", "users", "view", "View users"),
            new Permission("users.create", "users", "create", "Create users"),
            new Permission("users.edit", "users", "edit", "Edit users"),
            new Permission("users.delete", "users", "delete", "Delete users"),

            // Project permissions
            new Permission("projects.view", "projects", "view", "View projects"),
            new Permission("projects.create", "projects", "create", "Create projects"),
            new Permission("projects.edit", "projects", "edit", "Edit projects"),
            new Permission("projects.delete", "projects", "delete", "Delete projects"),

            // Task permissions
            new Permission("tasks.view", "tasks", "view", "View tasks"),
            new Permission("tasks.create", "tasks", "create", "Create tasks"),
            new Permission("tasks.edit", "tasks", "edit", "Edit tasks"),
            new Permission("tasks.delete", "tasks", "delete", "Delete tasks"),

            // People/HR permissions
            new Permission("people.view", "people", "view", "View employee data"),
            new Permission("people.edit", "people", "edit", "Edit employee data"),
            new Permission("people.delete", "people", "delete", "Delete employee data"),

            // Payroll permissions
            new Permission("payroll.view", "payroll", "view", "View payroll data"),
            new Permission("payroll.edit", "payroll", "edit", "Edit payroll data"),

            // Reports permissions
            new Permission("reports.view", "reports", "view", "View reports"),
            new Permission("reports.create", "reports", "create", "Create reports"),

            // Organization permissions
            new Permission("organization.view", "organization", "view", "View organization settings"),
            new Permission("organization.edit", "organization", "edit", "Edit organization settings")
        );

        for (Permission permission : permissions) {
            if (!permissionRepository.existsByName(permission.getName())) {
                permissionRepository.save(permission);
                logger.info("Created permission: {}", permission.getName());
            }
        }
    }

    private void createRolesIfNotExist() {
        // ADMIN Role - Full access
        createRoleWithPermissions(
            "ROLE_ADMIN",
            "Administrator - Full system access",
            Arrays.asList(
                "users.view", "users.create", "users.edit", "users.delete",
                "projects.view", "projects.create", "projects.edit", "projects.delete",
                "tasks.view", "tasks.create", "tasks.edit", "tasks.delete",
                "people.view", "people.edit", "people.delete",
                "payroll.view", "payroll.edit",
                "reports.view", "reports.create",
                "organization.view", "organization.edit"
            )
        );

        // HR Role - Employee and payroll management
        createRoleWithPermissions(
            "ROLE_HR",
            "Human Resources - Employee and payroll management",
            Arrays.asList(
                "users.view", "users.create", "users.edit",
                "projects.view",
                "tasks.view",
                "people.view", "people.edit",
                "payroll.view", "payroll.edit",
                "reports.view"
            )
        );

        // MANAGER Role - Team and project management
        createRoleWithPermissions(
            "ROLE_MANAGER",
            "Manager - Team and project management",
            Arrays.asList(
                "projects.view", "projects.create", "projects.edit", "projects.delete",
                "tasks.view", "tasks.create", "tasks.edit", "tasks.delete",
                "people.view",
                "reports.view"
            )
        );

        // EMPLOYEE Role - Standard access
        createRoleWithPermissions(
            "ROLE_EMPLOYEE",
            "Employee - Standard employee access",
            Arrays.asList(
                "projects.view", "projects.create",
                "tasks.view", "tasks.create", "tasks.edit"
            )
        );

        // GUEST Role - Read-only access
        createRoleWithPermissions(
            "ROLE_GUEST",
            "Guest - Read-only access",
            Arrays.asList(
                "projects.view",
                "tasks.view"
            )
        );
    }

    private void createRoleWithPermissions(String roleName, String description, List<String> permissionNames) {
        Role role = roleRepository.findByName(roleName).orElse(null);

        if (role == null) {
            role = new Role(roleName, description);
            logger.info("Creating new role: {}", roleName);
        } else {
            role.setDescription(description);
            logger.info("Updating existing role: {}", roleName);
        }

        // Always update permissions to ensure they match the code definition
        // This handles cases where permissions were added/removed in code
        // We use a Set to avoid duplicates if the entity uses a List
        for (String permName : permissionNames) {
            Permission permission = permissionRepository.findByName(permName).orElse(null);
            if (permission != null) {
                // Check if role already has this permission to avoid unnecessary DB operations/duplicates
                boolean hasPermission = role.getPermissions().stream()
                        .anyMatch(p -> p.getName().equals(permName));
                
                if (!hasPermission) {
                    role.addPermission(permission);
                }
            }
        }

        roleRepository.save(role);
        logger.info("Saved role: {} with {} permissions", roleName, role.getPermissions().size());
    }
}
