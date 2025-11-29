package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.example.models.enums.TaskStatus;
import org.example.models.enums.ProjectStage;
import org.example.models.enums.TaskPriority;
import org.example.models.ResourceAssignment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_task_status", columnList = "status"),
    @Index(name = "idx_task_priority", columnList = "priority"),
    @Index(name = "idx_task_due_date", columnList = "due_date"),
    @Index(name = "idx_task_project_id", columnList = "project_id"),
    @Index(name = "idx_task_assignee_id", columnList = "assignee_id")
})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_number", nullable = false)
    private String taskNumber;

    @Column(nullable = false)
    private String name;

    @Lob // For potentially longer text
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_stage", nullable = false)
    private ProjectStage projectStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private TaskPriority priority;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = true)
    @JsonIgnore
    private Phase phase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = true)
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private User reporter; // The user who created the task

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id") // Can be null if task is unassigned
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private User assignee; // The user to whom the task is assigned

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_by_id") // Can be null if no checker is assigned
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private User checkedBy; // The user responsible for verifying task completion

    /**
     * Level 2 Reference: Optional link to ResourceAssignment
     * If set, billing/cost rates flow from the ResourceAssignment.
     * If not set, task uses default user rates or direct assignment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_assignment_id")
    @JsonIgnore
    private ResourceAssignment resourceAssignment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TimeLog> timeLogs = new ArrayList<>();

    // Constructors
    public Task() {
        this.status = TaskStatus.TO_DO; // Default status
        this.priority = TaskPriority.MEDIUM; // Default priority
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(String taskNumber) {
        this.taskNumber = taskNumber;
    }

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

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public ProjectStage getProjectStage() {
        return projectStage;
    }

    public void setProjectStage(ProjectStage projectStage) {
        this.projectStage = projectStage;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Phase getPhase() {
        return phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
        // Optional: set project from phase if needed, or rely on phase.getProject()
        if (phase != null) {
            this.project = phase.getProject();
        }
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getReporter() {
        return reporter;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
    }

    public User getCheckedBy() {
        return checkedBy;
    }

    public void setCheckedBy(User checkedBy) {
        this.checkedBy = checkedBy;
    }

    public ResourceAssignment getResourceAssignment() {
        return resourceAssignment;
    }

    public void setResourceAssignment(ResourceAssignment resourceAssignment) {
        this.resourceAssignment = resourceAssignment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TimeLog> getTimeLogs() {
        return timeLogs;
    }

    public void setTimeLogs(List<TimeLog> timeLogs) {
        this.timeLogs = timeLogs;
    }

    // Helper method to add a time log
    public void addTimeLog(TimeLog timeLog) {
        timeLogs.add(timeLog);
        timeLog.setTask(this);
    }

    public void removeTimeLog(TimeLog timeLog) {
        timeLogs.remove(timeLog);
        timeLog.setTask(null);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now(); // Also set updatedAt on creation
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // equals, hashCode, toString (important for entities)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Task task = (Task) o;
        return Objects.equals(id, task.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Task{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", projectId=" + (project != null ? project.getId() : null) +
                ", reporterId=" + (reporter != null ? reporter.getId() : null) +
                ", assigneeId=" + (assignee != null ? assignee.getId() : null) +
                ", checkedById=" + (checkedBy != null ? checkedBy.getId() : null) +
                '}';
    }
}