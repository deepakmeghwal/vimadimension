package org.example.controller;

import org.example.dto.ProjectCreateDto;
import org.example.dto.ProjectUpdateDto;
import org.example.dto.TaskCreateDto;
import org.example.models.Client;
import org.example.models.Project;
import org.example.models.Task;
import org.example.models.User;
import org.example.service.ProjectService;
import org.example.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import jakarta.validation.Valid; // For DTO validation
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectService projectService;
    private final TaskService taskService;
    private final org.example.service.PhaseService phaseService;
    private final org.example.service.ResourceAssignmentService resourceAssignmentService;

    @Autowired
    public ProjectController(ProjectService projectService, TaskService taskService, 
                            org.example.service.PhaseService phaseService,
                            org.example.service.ResourceAssignmentService resourceAssignmentService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.phaseService = phaseService;
        this.resourceAssignmentService = resourceAssignmentService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test database connection by trying to count projects
            long projectCount = projectService.findAllProjects().size();
            response.put("status", "healthy");
            response.put("database", "connected");
            response.put("projectCount", projectCount);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Health check failed: {}", e.getMessage(), e);
            response.put("status", "unhealthy");
            response.put("database", "disconnected");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testPost(@RequestBody(required = false) Map<String, Object> requestBody) {
        logger.info("POST /projects/test endpoint hit!");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "POST endpoint is working");
        response.put("timestamp", System.currentTimeMillis());
        response.put("requestBody", requestBody);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Project>> listProjects(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to list projects");
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            logger.info("Attempting to list projects for user: {}", username);
            List<Project> projects = projectService.findProjectsByOrganization(username);
            logger.info("Successfully listed projects for user {}. Found: {} projects.", username, projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Error listing projects: {}", e.getMessage(), e);
            throw e; // Re-throw to see the full stack trace
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> listProjectsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to list paginated projects");
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            logger.info("Attempting to list paginated projects for user: {} (page: {}, size: {}, category: {}, priority: {}, status: {})", 
                       username, page, size, category, priority, status);
            
            Map<String, Object> response = projectService.findProjectsPaginatedAndFiltered(
                username, page, size, category, priority, status);
            
            logger.info("Successfully listed paginated projects for user {}. Found: {} projects on page {} of {}", 
                       username, response.get("totalItems"), page + 1, response.get("totalPages"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error listing paginated projects: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to retrieve projects"));
        }
    }

    @GetMapping("/new")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> showCreateProjectForm() {
        Map<String, Object> response = new HashMap<>();
        response.put("projectCreateDto", new ProjectCreateDto());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveProject(@ModelAttribute("projectCreateDto") ProjectCreateDto projectDto,
                              BindingResult result,
                              Authentication authentication) {
        logger.info("Received project creation request: {}", projectDto.getName());
        
        if (result.hasErrors()) {
            logger.warn("Validation errors: {}", result.getAllErrors());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("errors", result.getAllErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated project creation attempt");
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not authenticated."));
        }
        String currentUsername = authentication.getName();
        logger.info("Creating project for user: {}", currentUsername);

        try {
            Project savedProject = projectService.createProject(projectDto, currentUsername);
            logger.info("Project created successfully: {}", savedProject.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project '" + savedProject.getName() + "' created successfully!");
            response.put("project", savedProject);
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            logger.error("User not found during project creation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Error: Creator user not found. " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating project: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Error creating project: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> showProjectDetails(@PathVariable("id") Long projectId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "12") int size) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to view details for non-existent project ID: {}", projectId);
            return ResponseEntity.notFound().build();
        }
        Project project = projectOptional.get();

        // Fetch and add tasks for this project with detailed information
        Map<String, Object> paginatedTasks;
        try {
            paginatedTasks = taskService.getTasksByProjectIdPaginated(projectId, page, size);
        } catch (IllegalArgumentException ex) {
            logger.warn("Invalid pagination parameters for project {} details: {}", projectId, ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", ex.getMessage(),
                    "projectId", projectId
            ));
        }
        @SuppressWarnings("unchecked")
        List<Task> tasks = (List<Task>) paginatedTasks.getOrDefault("tasks", List.of());
        List<Map<String, Object>> taskResponses = new ArrayList<>();
        
        for (Task task : tasks) {
            Map<String, Object> taskResponse = buildTaskResponse(task);
            taskResponses.add(taskResponse);
        }

        long totalItems = ((Number) paginatedTasks.getOrDefault("totalItems", tasks.size())).longValue();
        logger.debug("Displaying details for project ID: {} with {} tasks (page {}).", projectId, totalItems, paginatedTasks.getOrDefault("currentPage", page));
        
        Map<String, Object> response = new HashMap<>();
        response.put("project", project);
        response.put("phases", phaseService.getPhasesByProjectId(projectId)); // Add phases
        response.put("tasks", taskResponses);
        
        // Add team roster (users who have access or are assigned to tasks)
        // For now, we'll just include the project creator and task assignees as the "team"
        // In a real app, you might have a dedicated ProjectMember entity
        // This is a simplified view for the Hub
        
        Map<String, Object> paginationMetadata = new HashMap<>(paginatedTasks);
        paginationMetadata.remove("tasks");
        response.put("taskPagination", paginationMetadata);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/edit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> showUpdateProjectForm(@PathVariable("id") Long projectId) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to edit non-existent project ID: {}", projectId);
            return ResponseEntity.notFound().build();
        }

        Project project = projectOptional.get();
        ProjectUpdateDto projectUpdateDto = new ProjectUpdateDto();
        projectUpdateDto.setName(project.getName());
        projectUpdateDto.setClientId(project.getClient().getId());
        projectUpdateDto.setStartDate(project.getStartDate());
        projectUpdateDto.setEstimatedEndDate(project.getEstimatedEndDate());
        projectUpdateDto.setLocation(project.getLocation());
        projectUpdateDto.setLocation(project.getLocation());
        projectUpdateDto.setChargeType(project.getChargeType());
        projectUpdateDto.setStatus(project.getStatus());
        projectUpdateDto.setProjectStage(project.getProjectStage());
        projectUpdateDto.setDescription(project.getDescription());
        projectUpdateDto.setBudget(project.getBudget());
        projectUpdateDto.setActualCost(project.getActualCost());
        projectUpdateDto.setPriority(project.getPriority());

        logger.debug("Displaying edit form for project ID: {}", projectId);
        
        // Safely serialize client to avoid Hibernate proxy serialization issues
        Map<String, Object> clientInfo = null;
        if (project.getClient() != null) {
            Client client = project.getClient();
            clientInfo = new HashMap<>();
            clientInfo.put("id", client.getId());
            clientInfo.put("name", client.getName());
            clientInfo.put("code", client.getCode());
            clientInfo.put("billingAddress", client.getBillingAddress());
            clientInfo.put("paymentTerms", client.getPaymentTerms());
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("projectUpdateDto", projectUpdateDto);
        response.put("projectId", projectId);
        response.put("client", clientInfo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProject(@PathVariable("id") Long projectId,
                                @ModelAttribute("projectUpdateDto") ProjectUpdateDto projectUpdateDto,
                                BindingResult result) {

        if (result.hasErrors()) {
            logger.warn("Validation errors while updating project ID {}: {}", projectId, result.getAllErrors());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("errors", result.getAllErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            projectService.updateProject(projectId, projectUpdateDto);
            logger.info("Project ID {} updated successfully.", projectId);
            return ResponseEntity.ok(Map.of("message", "Project updated successfully!"));
        } catch (IllegalArgumentException e) {
            logger.error("Error updating project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteProject(@PathVariable("id") Long projectId) {
        try {
            boolean deleted = projectService.deleteProject(projectId);
            if (deleted) {
                logger.info("Project ID {} deleted successfully.", projectId);
                return ResponseEntity.ok(Map.of("message", "Project deleted successfully."));
            } else {
                logger.warn("Attempt to delete project ID {} failed, project not found or other issue.", projectId);
                return ResponseEntity.badRequest().body(Map.of("error", "Project not found or could not be deleted."));
            }
        } catch (IllegalStateException e) {
            logger.warn("Attempt to delete project ID {} failed: {}", projectId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting project: " + e.getMessage()));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            logger.error("Database constraint violation while deleting project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Cannot delete project due to existing dependencies. Please ensure all related data is removed first."));
        } catch (Exception e) {
            logger.error("Unexpected error while deleting project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred while deleting the project."));
        }
    }

    // Task creation endpoints
    @PostMapping("/{projectId}/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTaskForProject(@PathVariable Long projectId,
                                                 @RequestParam Map<String, String> params) {
        logger.info("Received task creation request for project {}: name='{}'", 
                   projectId, params.get("name"));
        
        try {
            String name = params.get("name");
            String description = params.get("description");
            String projectStageStr = params.get("projectStage");
            String phaseIdStr = params.get("phaseId");
            String assigneeIdStr = params.get("assigneeId");
            String checkedByIdStr = params.get("checkedById");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Task name is required."));
            }
            
            if (projectStageStr == null || projectStageStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Project stage is required."));
            }
            
            org.example.models.enums.ProjectStage projectStage;
            try {
                projectStage = org.example.models.enums.ProjectStage.valueOf(projectStageStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid project stage: " + projectStageStr));
            }
            
            Optional<Long> phaseIdOpt = phaseIdStr != null && !phaseIdStr.trim().isEmpty() 
                    ? Optional.of(Long.parseLong(phaseIdStr)) 
                    : Optional.empty();
            Optional<Long> assigneeIdOpt = assigneeIdStr != null && !assigneeIdStr.trim().isEmpty() 
                    ? Optional.of(Long.parseLong(assigneeIdStr)) 
                    : Optional.empty();
            Optional<Long> checkedByIdOpt = checkedByIdStr != null && !checkedByIdStr.trim().isEmpty() 
                    ? Optional.of(Long.parseLong(checkedByIdStr)) 
                    : Optional.empty();
            
            logger.info("Creating task with name: '{}' for project: {} (phase: {})", 
                       name, projectId, phaseIdOpt.orElse(null));
            
            taskService.createTaskForProject(
                    name,
                    description,
                    projectStage,
                    projectId,
                    phaseIdOpt,
                    assigneeIdOpt,
                    checkedByIdOpt
            );
            return ResponseEntity.ok(Map.of("message", "Task created successfully!"));
        } catch (NumberFormatException e) {
            logger.error("Error parsing numeric parameter: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid numeric parameter: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Error creating task for project ID {}: {}", projectId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error creating task for project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create task: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to build a task response with all related information
     */
    private Map<String, Object> buildTaskResponse(Task task) {
        Map<String, Object> taskResponse = new HashMap<>();
        taskResponse.put("id", task.getId());
        taskResponse.put("name", task.getName());
        taskResponse.put("description", task.getDescription());
        taskResponse.put("status", task.getStatus());
        taskResponse.put("projectStage", task.getProjectStage());
        taskResponse.put("priority", task.getPriority());
        taskResponse.put("dueDate", task.getDueDate());
        taskResponse.put("createdAt", task.getCreatedAt());
        taskResponse.put("updatedAt", task.getUpdatedAt());
        
        // Add project information
        if (task.getProject() != null) {
            Map<String, Object> projectInfo = new HashMap<>();
            try {
                Project project = task.getProject();
                // Check if proxy is initialized before accessing properties
                if (org.hibernate.Hibernate.isInitialized(project)) {
                    projectInfo.put("id", project.getId());
                    projectInfo.put("name", project.getName());
                    // Safely access client if initialized
                    if (project.getClient() != null && org.hibernate.Hibernate.isInitialized(project.getClient())) {
                        projectInfo.put("clientName", project.getClient().getName());
                    }
                } else {
                    // If proxy not initialized, just use ID
                    projectInfo.put("id", project.getId());
                }
                taskResponse.put("project", projectInfo);
            } catch (org.hibernate.LazyInitializationException e) {
                // Fallback: just include project ID
                projectInfo.put("id", task.getProject().getId());
                taskResponse.put("project", projectInfo);
            }
        }
        
        // Add assignee information
        if (task.getAssignee() != null) {
            Map<String, Object> assigneeInfo = new HashMap<>();
            assigneeInfo.put("id", task.getAssignee().getId());
            assigneeInfo.put("username", task.getAssignee().getUsername());
            assigneeInfo.put("name", task.getAssignee().getName());
            assigneeInfo.put("email", task.getAssignee().getEmail());
            taskResponse.put("assignee", assigneeInfo);
        }
        
        // Add reporter information
        if (task.getReporter() != null) {
            Map<String, Object> reporterInfo = new HashMap<>();
            reporterInfo.put("id", task.getReporter().getId());
            reporterInfo.put("username", task.getReporter().getUsername());
            reporterInfo.put("name", task.getReporter().getName());
            reporterInfo.put("email", task.getReporter().getEmail());
            taskResponse.put("reporter", reporterInfo);
        }
        
        // Add checked by information
        if (task.getCheckedBy() != null) {
            Map<String, Object> checkedByInfo = new HashMap<>();
            checkedByInfo.put("id", task.getCheckedBy().getId());
            checkedByInfo.put("username", task.getCheckedBy().getUsername());
            checkedByInfo.put("name", task.getCheckedBy().getName());
            checkedByInfo.put("email", task.getCheckedBy().getEmail());
            taskResponse.put("checkedBy", checkedByInfo);
        }

        // Add phase information
        if (task.getPhase() != null) {
            Map<String, Object> phaseInfo = new HashMap<>();
            phaseInfo.put("id", task.getPhase().getId());
            phaseInfo.put("name", task.getPhase().getName());
            phaseInfo.put("phaseNumber", task.getPhase().getPhaseNumber());
            taskResponse.put("phase", phaseInfo);
        }
        
        return taskResponse;
    }

    // ========== PROJECT TEAM MANAGEMENT ENDPOINTS ==========

    /**
     * Get all users assigned to a project
     */
    @GetMapping("/{projectId}/team")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProjectTeam(@PathVariable Long projectId) {
        try {
            List<User> teamMembers = projectService.getProjectTeamMembers(projectId);
            List<Map<String, Object>> teamList = teamMembers.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("name", user.getName() != null ? user.getName() : user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("designation", user.getDesignation() != null ? user.getDesignation() : "");
                    return userMap;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "team", teamList
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching project team: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch project team"));
        }
    }

    /**
     * Get available users from the same organization who can be assigned to the project
     */
    @GetMapping("/{projectId}/team/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAvailableUsersForProject(@PathVariable Long projectId) {
        try {
            // Get all enabled users from the same organization
            List<User> allUsers = taskService.getAllUsersForTaskAssignment();
            
            // Get users already assigned to the project
            List<User> assignedUsers = projectService.getProjectTeamMembers(projectId);
            Set<Long> assignedUserIds = assignedUsers.stream()
                .map(User::getId)
                .collect(java.util.stream.Collectors.toSet());
            
            // Filter out already assigned users
            List<Map<String, Object>> availableUsers = allUsers.stream()
                .filter(user -> !assignedUserIds.contains(user.getId()))
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("name", user.getName() != null ? user.getName() : user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("designation", user.getDesignation() != null ? user.getDesignation() : "");
                    return userMap;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", availableUsers
            ));
        } catch (Exception e) {
            logger.error("Error fetching available users: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch available users"));
        }
    }

    /**
     * Assign a user to a project
     */
    @PostMapping("/{projectId}/team/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> assignUserToProject(@PathVariable Long projectId, @PathVariable Long userId) {
        try {
            projectService.assignUserToProject(projectId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User assigned to project successfully"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error assigning user to project: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to assign user to project"));
        }
    }

    /**
     * Remove a user from a project
     */
    @DeleteMapping("/{projectId}/team/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeUserFromProject(@PathVariable Long projectId, @PathVariable Long userId) {
        try {
            projectService.removeUserFromProject(projectId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User removed from project successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error removing user from project: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to remove user from project"));
        }
    }

    /**
     * Get all resource assignments for a project (across all phases)
     * Level 2: Resource Planning endpoint
     */
    @GetMapping("/{projectId}/resources")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProjectResourceAssignments(@PathVariable Long projectId) {
        try {
            List<org.example.models.ResourceAssignment> assignments = 
                resourceAssignmentService.getResourceAssignmentsByProject(projectId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "assignments", assignments
            ));
        } catch (Exception e) {
            logger.error("Error fetching project resource assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch resource assignments"));
        }
    }
}
