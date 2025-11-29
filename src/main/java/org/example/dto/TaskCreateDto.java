package org.example.dto;

import org.example.models.enums.ProjectStage;
import org.example.models.enums.TaskPriority;
import java.time.LocalDate;

// Consider adding validation annotations later (e.g., from jakarta.validation.constraints)
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Size;

public class TaskCreateDto {

    // @NotBlank(message = "Task name cannot be blank")
    // @Size(min = 3, max = 255, message = "Task name must be between 3 and 255 characters")
    private String name;

    // @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;

    // @NotNull(message = "Project stage cannot be null")
    private ProjectStage projectStage;

    // @NotNull(message = "Phase ID cannot be null")
    private Long phaseId;

    private Long assigneeId; // Optional: ID of the user to assign the task to

    private Long checkedById; // Optional: ID of the user who will check task completion

    private TaskPriority priority; // Optional: Task priority

    private LocalDate dueDate; // Optional: Due date for the task

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStage getProjectStage() {
        return projectStage;
    }

    public void setProjectStage(ProjectStage projectStage) {
        this.projectStage = projectStage;
    }

    public Long getPhaseId() {
        return phaseId;
    }

    public void setPhaseId(Long phaseId) {
        this.phaseId = phaseId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Long getCheckedById() {
        return checkedById;
    }

    public void setCheckedById(Long checkedById) {
        this.checkedById = checkedById;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}