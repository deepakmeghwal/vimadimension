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
            new Permission("tasks.approve", "tasks", "approve", "Approve/review tasks (Checked By)"),

            // Client permissions
            new Permission("clients.view", "clients", "view", "View clients"),
            new Permission("clients.create", "clients", "create", "Create clients"),
            new Permission("clients.edit", "clients", "edit", "Edit clients"),
            new Permission("clients.delete", "clients", "delete", "Delete clients"),

            // Invoice permissions
            new Permission("invoices.view", "invoices", "view", "View invoices"),
            new Permission("invoices.create", "invoices", "create", "Create invoices"),
            new Permission("invoices.edit", "invoices", "edit", "Edit invoices"),
            new Permission("invoices.delete", "invoices", "delete", "Delete invoices"),

            // Phase permissions
            new Permission("phases.view", "phases", "view", "View project phases"),
            new Permission("phases.create", "phases", "create", "Create project phases"),
            new Permission("phases.edit", "phases", "edit", "Edit project phases"),
            new Permission("phases.delete", "phases", "delete", "Delete project phases"),

            // Time entry permissions
            new Permission("timeentries.view", "timeentries", "view", "View time entries"),
            new Permission("timeentries.create", "timeentries", "create", "Create time entries"),
            new Permission("timeentries.edit", "timeentries", "edit", "Edit time entries"),
            new Permission("timeentries.delete", "timeentries", "delete", "Delete time entries"),

            // Attachment/Drawing permissions
            new Permission("attachments.view", "attachments", "view", "View attachments/drawings"),
            new Permission("attachments.upload", "attachments", "upload", "Upload attachments/drawings"),
            new Permission("attachments.delete", "attachments", "delete", "Delete attachments/drawings"),

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
        // ADMIN Role - Full access to everything
        createRoleWithPermissions(
            "ROLE_ADMIN",
            "Administrator - Full system access",
            Arrays.asList(
                // User management
                "users.view", "users.create", "users.edit", "users.delete",
                // Projects
                "projects.view", "projects.create", "projects.edit", "projects.delete",
                // Tasks
                "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.approve",
                // Clients
                "clients.view", "clients.create", "clients.edit", "clients.delete",
                // Invoices
                "invoices.view", "invoices.create", "invoices.edit", "invoices.delete",
                // Phases
                "phases.view", "phases.create", "phases.edit", "phases.delete",
                // Time entries
                "timeentries.view", "timeentries.create", "timeentries.edit", "timeentries.delete",
                // Attachments
                "attachments.view", "attachments.upload", "attachments.delete",
                // People/HR
                "people.view", "people.edit", "people.delete",
                // Payroll
                "payroll.view", "payroll.edit",
                // Reports
                "reports.view", "reports.create",
                // Organization
                "organization.view", "organization.edit"
            )
        );

        // HR Role - Employee and payroll management
        createRoleWithPermissions(
            "ROLE_HR",
            "Human Resources - Employee and payroll management",
            Arrays.asList(
                // User management (can view, create, edit but not delete)
                "users.view", "users.create", "users.edit",
                // Projects (view only)
                "projects.view",
                // Tasks (view only)
                "tasks.view",
                // Clients (view only for context)
                "clients.view",
                // Invoices (view for financial reporting)
                "invoices.view",
                // Time entries (full access for payroll calculation)
                "timeentries.view", "timeentries.create", "timeentries.edit", "timeentries.delete",
                // People/HR (core responsibility)
                "people.view", "people.edit",
                // Payroll (core responsibility)
                "payroll.view", "payroll.edit",
                // Reports
                "reports.view"
            )
        );

        // MANAGER Role - Team and project management
        createRoleWithPermissions(
            "ROLE_MANAGER",
            "Manager - Team and project management",
            Arrays.asList(
                // Projects (full CRUD except delete which is admin-only)
                "projects.view", "projects.create", "projects.edit",
                // Tasks (full access including approvals)
                "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.approve",
                // Clients (can manage clients for their projects)
                "clients.view", "clients.create", "clients.edit",
                // Invoices (can create and view for their projects)
                "invoices.view", "invoices.create",
                // Phases (can manage project phases)
                "phases.view", "phases.create", "phases.edit", "phases.delete",
                // Time entries (can view team time entries)
                "timeentries.view", "timeentries.create", "timeentries.edit",
                // Attachments (can manage project attachments)
                "attachments.view", "attachments.upload", "attachments.delete",
                // People (view team members)
                "people.view",
                // Reports
                "reports.view"
            )
        );

        // EMPLOYEE Role - Standard access (no project creation)
        createRoleWithPermissions(
            "ROLE_EMPLOYEE",
            "Employee - Standard employee access",
            Arrays.asList(
                // Projects (view only - cannot create projects)
                "projects.view",
                // Tasks (can create and edit their own tasks)
                "tasks.view", "tasks.create", "tasks.edit",
                // Clients (view only for context)
                "clients.view",
                // Phases (view only)
                "phases.view",
                // Time entries (can log their own time)
                "timeentries.view", "timeentries.create", "timeentries.edit",
                // Attachments (can view and upload)
                "attachments.view", "attachments.upload"
            )
        );

        // GUEST Role - Read-only access
        createRoleWithPermissions(
            "ROLE_GUEST",
            "Guest - Read-only access",
            Arrays.asList(
                "projects.view",
                "tasks.view",
                "phases.view"
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
