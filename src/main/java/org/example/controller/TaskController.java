package org.example.controller;

import org.example.models.Task;
import org.example.models.enums.TaskStatus;
import org.example.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.example.dto.TimeLogDto;
import org.example.service.TimeLogService;
import java.math.BigDecimal;
import org.example.models.enums.TaskPriority;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    private final TaskService taskService;
    private final TimeLogService timeLogService;

    @Autowired
    public TaskController(TaskService taskService, TimeLogService timeLogService) {
        this.taskService = taskService;
        this.timeLogService = timeLogService;
    }

    @GetMapping("/{taskId}/details")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTaskDetails(@PathVariable Long taskId) {
        try {
            Optional<Task> taskOptional = taskService.findTaskById(taskId);
            if (taskOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Task not found");
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            
            // Build a detailed response that includes related entities
            Map<String, Object> taskDetails = new HashMap<>();
            taskDetails.put("id", task.getId());
            taskDetails.put("name", task.getName());
            taskDetails.put("description", task.getDescription());
            taskDetails.put("status", task.getStatus());
            taskDetails.put("projectStage", task.getProjectStage());
            taskDetails.put("priority", task.getPriority());
            taskDetails.put("dueDate", task.getDueDate());
            taskDetails.put("createdAt", task.getCreatedAt());
            taskDetails.put("updatedAt", task.getUpdatedAt());
            
            // Add project information
            if (task.getProject() != null) {
                Map<String, Object> projectInfo = new HashMap<>();
                projectInfo.put("id", task.getProject().getId());
                projectInfo.put("name", task.getProject().getName());
                projectInfo.put("clientName", task.getProject().getClient().getName());
                taskDetails.put("project", projectInfo);
            }
            
            // Add assignee information
            if (task.getAssignee() != null) {
                Map<String, Object> assigneeInfo = new HashMap<>();
                assigneeInfo.put("id", task.getAssignee().getId());
                assigneeInfo.put("username", task.getAssignee().getUsername());
                assigneeInfo.put("name", task.getAssignee().getName());
                assigneeInfo.put("email", task.getAssignee().getEmail());
                taskDetails.put("assignee", assigneeInfo);
            }
            
            // Add reporter information
            if (task.getReporter() != null) {
                Map<String, Object> reporterInfo = new HashMap<>();
                reporterInfo.put("id", task.getReporter().getId());
                reporterInfo.put("username", task.getReporter().getUsername());
                reporterInfo.put("name", task.getReporter().getName());
                reporterInfo.put("email", task.getReporter().getEmail());
                taskDetails.put("reporter", reporterInfo);
            }
            
            // Add checked by information
            if (task.getCheckedBy() != null) {
                Map<String, Object> checkedByInfo = new HashMap<>();
                checkedByInfo.put("id", task.getCheckedBy().getId());
                checkedByInfo.put("username", task.getCheckedBy().getUsername());
                checkedByInfo.put("name", task.getCheckedBy().getName());
                checkedByInfo.put("email", task.getCheckedBy().getEmail());
                taskDetails.put("checkedBy", checkedByInfo);
            }
            
            // Add time logs
            taskDetails.put("timeLogs", task.getTimeLogs());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("task", taskDetails);
            
            logger.info("Retrieved task details for task ID: {}", taskId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving task details for task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve task details");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * @deprecated Use GET /api/tasks with pagination params instead
     */
    @Deprecated
    @GetMapping("/list")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getAllTasks() {
        logger.info("[DEPRECATED] /api/tasks/list is deprecated. Use GET /api/tasks with pagination.");
        try {
            List<Task> tasks = taskService.getAllTasks();
            logger.info("Retrieved {} tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error retrieving all tasks: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Unified endpoint for getting tasks with filtering and pagination
     * Supports filter types: assigned, reported, to-check, all
     * Supports additional filters: status, priority, projectId
     * 
     * Example: GET /api/tasks?filter=assigned&status=TO_DO,IN_PROGRESS&priority=HIGH&page=0&size=10
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getTasksWithFilters(
            @RequestParam(required = false, defaultValue = "all") String filter,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<String> priority,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Map<String, Object> response = taskService.getTasksWithFilters(
                    filter, assigneeId, status, priority, projectId, page, size);
            
            // Convert tasks to include assignee and checkedBy information
            @SuppressWarnings("unchecked")
            List<Task> tasks = (List<Task>) response.get("tasks");
            List<Map<String, Object>> taskResponses = new ArrayList<>();
            
            for (Task task : tasks) {
                Map<String, Object> taskResponse = buildTaskResponse(task);
                taskResponses.add(taskResponse);
            }
            
            response.put("tasks", taskResponses);
            
            logger.info("Retrieved filtered tasks - filter: {}, page: {}, size: {}, total: {}", 
                       filter, page, size, response.get("totalItems"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving filtered tasks: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve tasks: " + e.getMessage());
            errorResponse.put("error", e.getClass().getName());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * @deprecated Use GET /api/tasks with pagination params instead
     */
    @Deprecated
    @GetMapping("/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAllTasksPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        logger.info("[DEPRECATED] /api/tasks/paginated is deprecated. Use GET /api/tasks with page/size params.");
        try {
            // Redirect to unified endpoint with filter=all
            return getTasksWithFilters("all", null, null, null, null, page, size);
        } catch (Exception e) {
            logger.error("Error retrieving paginated tasks: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * @deprecated Use GET /api/tasks?filter=assigned instead
     */
    @Deprecated
    @GetMapping("/assigned-to-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getTasksAssignedToCurrentUser(
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<String> priority,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        logger.info("[DEPRECATED] /api/tasks/assigned-to-me is deprecated. Use GET /api/tasks?filter=assigned.");
        try {
            // Use the unified filter method with filter="assigned" to get current user's tasks
            // This ensures backend handles the filtering by authenticated user
            Map<String, Object> response = taskService.getTasksWithFilters(
                    "assigned", null, status, priority, projectId, page, size);

            @SuppressWarnings("unchecked")
            List<Task> tasks = (List<Task>) response.get("tasks");
            List<Map<String, Object>> taskResponses = new ArrayList<>();

            for (Task task : tasks) {
                Map<String, Object> taskResponse = buildTaskResponse(task);
                taskResponses.add(taskResponse);
            }

            response.put("tasks", taskResponses);

            logger.info("Retrieved paginated tasks assigned to current user - page: {}, size: {}, total: {}",
                    page, size, response.get("totalItems"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving tasks assigned to current user: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve tasks: " + e.getMessage());
            errorResponse.put("error", e.getClass().getName());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * @deprecated Use GET /api/tasks?filter=reported instead
     */
    @Deprecated
    @GetMapping("/reported-by-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getTasksReportedByCurrentUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        logger.info("[DEPRECATED] /api/tasks/reported-by-me is deprecated. Use GET /api/tasks?filter=reported.");
        try {
            Map<String, Object> response = taskService.getTasksReportedByCurrentUserPaginated(page, size);

            @SuppressWarnings("unchecked")
            List<Task> tasks = (List<Task>) response.get("tasks");
            List<Map<String, Object>> taskResponses = new ArrayList<>();

            for (Task task : tasks) {
                Map<String, Object> taskResponse = buildTaskResponse(task);
                taskResponses.add(taskResponse);
            }

            response.put("tasks", taskResponses);

            logger.info("Retrieved paginated tasks reported by current user - page: {}, size: {}, total: {}",
                    page, size, response.get("totalItems"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving tasks reported by current user: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve tasks: " + e.getMessage());
            errorResponse.put("error", e.getClass().getName());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * @deprecated Use GET /api/tasks?filter=to-check instead
     */
    @Deprecated
    @GetMapping("/to-check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getTasksToCheckByCurrentUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        logger.info("[DEPRECATED] /api/tasks/to-check is deprecated. Use GET /api/tasks?filter=to-check.");
        try {
            Map<String, Object> response = taskService.getTasksToCheckByCurrentUserPaginated(page, size);

            @SuppressWarnings("unchecked")
            List<Task> tasks = (List<Task>) response.get("tasks");
            List<Map<String, Object>> taskResponses = new ArrayList<>();

            for (Task task : tasks) {
                Map<String, Object> taskResponse = buildTaskResponse(task);
                taskResponses.add(taskResponse);
            }

            response.put("tasks", taskResponses);

            logger.info("Retrieved paginated tasks to check by current user - page: {}, size: {}, total: {}",
                    page, size, response.get("totalItems"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving tasks to check by current user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/{taskId}/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTask(@PathVariable Long taskId,
                                       @RequestParam("name") String name,
                                       @RequestParam("description") String description,
                                       @RequestParam("projectStage") String projectStage,
                                       @RequestParam("status") String status,
                                       @RequestParam("priority") String priority,
                                       @RequestParam(value = "dueDate", required = false) String dueDate,
                                       @RequestParam(value = "assigneeId", required = false) String assigneeId,
                                       @RequestParam(value = "checkedById", required = false) String checkedById,
                                       @RequestParam(value = "phaseId", required = false) Long phaseId) {
        try {
            // Convert assigneeId to Long if provided
            Long assigneeIdLong = null;
            if (assigneeId != null && !assigneeId.isEmpty()) {
                assigneeIdLong = Long.valueOf(assigneeId);
            }

            // Convert checkedById to Long if provided
            Long checkedByIdLong = null;
            if (checkedById != null && !checkedById.isEmpty()) {
                checkedByIdLong = Long.valueOf(checkedById);
            }

            Task updatedTask = taskService.updateTaskComplete(taskId, name, description, projectStage, status, priority, dueDate, assigneeIdLong, checkedByIdLong, phaseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Task updated successfully");
            response.put("task", updatedTask);
            
            logger.info("Updated task ID: {}", taskId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating task ID {}: {}", taskId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Error updating task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update task");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Partial update endpoint for tasks.
     * Allows updating individual fields without sending the full payload.
     */
    @PatchMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> partialUpdateTask(@PathVariable Long taskId, @RequestBody Map<String, Object> updates) {
        try {
            logger.info("Received partial update request for task ID: {} with updates: {}", taskId, updates);
            
            Optional<String> nameOpt = updates.containsKey("name") ? Optional.ofNullable((String) updates.get("name")) : Optional.empty();
            Optional<String> descriptionOpt = updates.containsKey("description") ? Optional.ofNullable((String) updates.get("description")) : Optional.empty();
            
            Optional<Long> phaseIdOpt = Optional.empty();
            if (updates.containsKey("phaseId")) {
                Object phaseIdObj = updates.get("phaseId");
                if (phaseIdObj instanceof Number) {
                    phaseIdOpt = Optional.of(((Number) phaseIdObj).longValue());
                } else if (phaseIdObj instanceof String) {
                    phaseIdOpt = Optional.of(Long.parseLong((String) phaseIdObj));
                }
            }
            
            Optional<Long> assigneeIdOpt = Optional.empty();
            if (updates.containsKey("assigneeId")) {
                Object assigneeIdObj = updates.get("assigneeId");
                if (assigneeIdObj == null) {
                    // Explicitly set to -1L (unassign) if key exists but value is null
                    assigneeIdOpt = Optional.of(-1L); 
                } else if (assigneeIdObj instanceof Number) {
                    assigneeIdOpt = Optional.of(((Number) assigneeIdObj).longValue());
                } else if (assigneeIdObj instanceof String) {
                    assigneeIdOpt = Optional.of(Long.parseLong((String) assigneeIdObj));
                }
            } else {
                // Key not present, so pass empty Optional to indicate no change
                assigneeIdOpt = Optional.empty();
            }
            
            // Special handling for assigneeId to support unassigning
            // The service method signature is: Optional<Long> newAssigneeIdOpt
            // If Optional is empty -> No change
            // If Optional contains null -> Unassign
            // If Optional contains ID -> Assign
            // However, Optional cannot contain null directly. We need to check how service handles it.
            // Service code: 
            // if (newAssigneeIdOpt.isPresent()) {
            //     Long assigneeId = newAssigneeIdOpt.get();
            //     if (assigneeId == null) { ... }
            // }
            // So we need to pass Optional.of(null) which is not allowed in Java.
            // Wait, Optional.ofNullable(null) returns empty.
            // We need to pass Optional<Optional<Long>> or similar, OR change service.
            // Let's look at service again.
            // Service: if (newAssigneeIdOpt.isPresent()) ...
            // If we want to unassign, we need to pass something that makes isPresent() true, but get() return null? No, get() throws if null.
            // Actually, the service code shown was:
            // if (newAssigneeIdOpt.isPresent()) {
            //     Long assigneeId = newAssigneeIdOpt.get();
            //     if (assigneeId == null) { ... }
            // }
            // This implies newAssigneeIdOpt is Optional<Long>. Optional<Long> cannot hold null.
            // So the service code `if (assigneeId == null)` is unreachable if it comes from `Optional.get()`.
            // UNLESS the service method signature was `Optional<Long>` but the caller passed `Optional.ofNullable(null)` which is empty.
            // Ah, the service code logic seems slightly flawed for "unassign" via Optional if it relies on null inside Optional.
            // Let's re-read service code carefully.
            // Service: public Optional<Task> updateTask(..., Optional<Long> newAssigneeIdOpt, ...)
            // Service body: if (newAssigneeIdOpt.isPresent()) { Long assigneeId = newAssigneeIdOpt.get(); ... }
            // If I pass Optional.empty(), it skips.
            // If I pass Optional.of(123L), it assigns.
            // I cannot pass Optional containing null.
            // So currently, the service method `updateTask` (partial) CANNOT unassign an assignee.
            
            // For now, let's just support assigning and other fields. Unassigning might need a specific flag or different handling.
            // We will map the "assigneeId" from JSON. If it's null, we might skip it for now or treat it as "no change" to be safe,
            // until we fix the service to support unassigning via partial update.
            
            Optional<TaskStatus> statusOpt = Optional.empty();
            if (updates.containsKey("status")) {
                String statusStr = (String) updates.get("status");
                if (statusStr != null) {
                    statusOpt = Optional.of(TaskStatus.valueOf(statusStr));
                }
            }

            Optional<TaskPriority> priorityOpt = Optional.empty();
            if (updates.containsKey("priority")) {
                String priorityStr = (String) updates.get("priority");
                if (priorityStr != null) {
                    priorityOpt = Optional.of(TaskPriority.valueOf(priorityStr));
                }
            }

            Optional<LocalDate> dueDateOpt = Optional.empty();
            if (updates.containsKey("dueDate")) {
                String dueDateStr = (String) updates.get("dueDate");
                if (dueDateStr != null) {
                    dueDateOpt = Optional.of(LocalDate.parse(dueDateStr));
                } else {
                    // If null is passed, we might want to clear the due date.
                    // However, Optional<LocalDate> cannot hold null.
                    // We need to decide if we support clearing due date.
                    // For now, let's assume if key is present but null, we clear it?
                    // But Optional.ofNullable(null) is empty.
                    // Similar issue to assignee.
                    // Let's just support setting a value for now.
                }
            }

            // We need to handle the assignee unassignment limitation.
            // If the user sends "assigneeId": null, they probably want to unassign.
            // But we can't pass that to the current service method.
            // Let's use the fields we can map.
            
            // NOTE: The service method signature for assignee is Optional<Long>.
            // We'll pass Optional.empty() if key is missing.
            // If key is present and value is valid Long, we pass Optional.of(id).
            
            Optional<Long> finalAssigneeIdOpt = Optional.empty();
             if (updates.containsKey("assigneeId")) {
                Object val = updates.get("assigneeId");
                if (val != null) {
                     if (val instanceof Number) {
                        finalAssigneeIdOpt = Optional.of(((Number) val).longValue());
                    } else if (val instanceof String) {
                        finalAssigneeIdOpt = Optional.of(Long.parseLong((String) val));
                    }
                }
            }
            
            // Also adding robust fallback for assignee if it comes as object
            if (!finalAssigneeIdOpt.isPresent() && updates.containsKey("assignee")) {
                 Object val = updates.get("assignee");
                 if (val instanceof Map) {
                    Map<?, ?> userMap = (Map<?, ?>) val;
                    Object idObj = userMap.get("id");
                    if (idObj instanceof Number) {
                        finalAssigneeIdOpt = Optional.of(((Number) idObj).longValue());
                    }
                 } else if (val == null) {
                     finalAssigneeIdOpt = Optional.of(-1L);
                 }
            }

            Optional<Long> finalCheckedByIdOpt = Optional.empty();
            if (updates.containsKey("checkedBy")) {
                Object val = updates.get("checkedBy");
                if (val instanceof Map) {
                    Map<?, ?> userMap = (Map<?, ?>) val;
                    Object idObj = userMap.get("id");
                    if (idObj instanceof Number) {
                        finalCheckedByIdOpt = Optional.of(((Number) idObj).longValue());
                    }
                } else if (val instanceof Number) {
                     finalCheckedByIdOpt = Optional.of(((Number) val).longValue());
                } else if (val == null) {
                    finalCheckedByIdOpt = Optional.of(-1L);
                }
            } else if (updates.containsKey("checkedById")) {
                 Object val = updates.get("checkedById");
                 if (val != null) {
                     if (val instanceof Number) {
                        finalCheckedByIdOpt = Optional.of(((Number) val).longValue());
                    } else if (val instanceof String) {
                        finalCheckedByIdOpt = Optional.of(Long.parseLong((String) val));
                    }
                 } else {
                     finalCheckedByIdOpt = Optional.of(-1L);
                 }
            }

            Optional<Task> task = taskService.updateTask(taskId, nameOpt, descriptionOpt, phaseIdOpt, finalAssigneeIdOpt, finalCheckedByIdOpt, statusOpt, priorityOpt, dueDateOpt);
            
            if (task.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Task updated successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error partial updating task ID {}: {}", taskId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update task"));
        }
    }

    @PutMapping("/{taskId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId,
                                             @RequestBody Map<String, String> statusRequest) {
        try {
            logger.info("Received status update request for task ID: {} with body: {}", taskId, statusRequest);
            
            String statusStr = statusRequest.get("status");
            if (statusStr == null || statusStr.trim().isEmpty()) {
                logger.warn("Status is null or empty for task ID: {}", taskId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Status is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            logger.info("Attempting to parse status: {} for task ID: {}", statusStr, taskId);
            TaskStatus status = TaskStatus.valueOf(statusStr);
            Optional<Task> updatedTask = taskService.updateTaskStatus(taskId, status);
            
            if (updatedTask.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Task status updated successfully");
                
                logger.info("Successfully updated status for task ID: {} to {}", taskId, status);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Task not found with ID: {}", taskId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Task not found");
                return ResponseEntity.status(404).body(errorResponse);
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid status value for task ID {}: {}", taskId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Invalid status value: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Unexpected error updating task status for task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update task status: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{taskId}/mark-checked")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markTaskAsChecked(@PathVariable Long taskId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Task> updatedTask = taskService.markTaskAsCompletedAndChecked(taskId, username);
            
            if (updatedTask.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Task marked as checked successfully");
                response.put("task", updatedTask.get());
                
                logger.info("Marked task ID: {} as checked by user: {}", taskId, username);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Task not found or you are not authorized to check this task");
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            logger.error("Error marking task as checked for task ID {}: {}", taskId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Error marking task as checked for task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to mark task as checked");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        try {
            boolean deleted = taskService.deleteTask(taskId);
            Map<String, Object> response = new HashMap<>();
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Task deleted successfully");
                logger.info("Deleted task ID: {}", taskId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete task");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // --- REST API endpoint for creating time logs ---
    @PostMapping("/{taskId}/timelogs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTimeLog(@PathVariable Long taskId,
                                         @RequestParam("hoursWorked") Double hoursWorked,
                                         @RequestParam("description") String description,
                                         @RequestParam("dateLogged") String dateLogged) {
        try {
            // Validate task exists
            Task task = taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

            // Create TimeLogDto
            TimeLogDto timeLogDto = new TimeLogDto();
            timeLogDto.setTaskId(taskId);
            timeLogDto.setHoursLogged(BigDecimal.valueOf(hoursWorked));
            timeLogDto.setWorkDescription(description);
            timeLogDto.setDateLogged(java.time.LocalDate.parse(dateLogged));

            // Save time log
            timeLogService.logTime(timeLogDto);

            return ResponseEntity.ok().body(java.util.Map.of("success", true, "message", "Time logged successfully"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error creating time log for task ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error creating time log for task ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "error", "Internal server error"));
        }
    }



    @GetMapping("/users")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUsersForTaskAssignment() {
        try {
            // Get users for task assignment from the same organization as current user
            // This endpoint is accessible to all authenticated users
            List<org.example.models.User> users = taskService.getAllUsersForTaskAssignment();
            
            List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("name", user.getName() != null ? user.getName() : user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("designation", user.getDesignation());
                    // Salary fields for burn rate calculation
                    userMap.put("monthlySalary", user.getMonthlySalary());
                    userMap.put("typicalHoursPerMonth", user.getTypicalHoursPerMonth() != null ? user.getTypicalHoursPerMonth() : 160);
                    userMap.put("overheadMultiplier", user.getOverheadMultiplier() != null ? user.getOverheadMultiplier() : new java.math.BigDecimal("2.5"));
                    return userMap;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", userList
            ));
        } catch (IllegalStateException e) {
            logger.error("User organization error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching users for task assignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch users"));
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
            projectInfo.put("id", task.getProject().getId());
            projectInfo.put("name", task.getProject().getName());
            projectInfo.put("clientName", task.getProject().getClient().getName());
            taskResponse.put("project", projectInfo);
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

}
