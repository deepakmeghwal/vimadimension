package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * Level 1: Project Team (Access List)
 * Represents who is allowed to see and access a project.
 * This is separate from resource assignments - it's about visibility and access control.
 */
@Entity
@Table(name = "project_team", indexes = {
    @Index(name = "idx_project_team_project_id", columnList = "project_id"),
    @Index(name = "idx_project_team_user_id", columnList = "user_id")
})
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "project_role", length = 50)
    private String projectRole; // e.g., "Project Manager", "Principal", "Observer"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ProjectTeam() {}

    public ProjectTeam(Project project, User user, String projectRole) {
        this.project = project;
        this.user = user;
        this.projectRole = projectRole;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProjectRole() {
        return projectRole;
    }

    public void setProjectRole(String projectRole) {
        this.projectRole = projectRole;
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

    // Helper methods for JSON serialization
    public Long getProjectId() {
        return project != null ? project.getId() : null;
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public String getUserName() {
        return user != null ? (user.getName() != null ? user.getName() : user.getUsername()) : null;
    }

    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }
}






