package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * PhaseSubstage - Represents a deliverable/task within a project phase.
 * Substages must be completed before invoice can be generated for the phase.
 */
@Entity
@Table(name = "phase_substages", indexes = {
    @Index(name = "idx_substage_phase_id", columnList = "phase_id"),
    @Index(name = "idx_substage_completed", columnList = "is_completed")
})
public class PhaseSubstage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = false)
    @JsonIgnore
    private Phase phase;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by")
    @JsonIgnore
    private User completedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public PhaseSubstage() {}

    public PhaseSubstage(Phase phase, String name, Integer displayOrder) {
        this.phase = phase;
        this.name = name;
        this.displayOrder = displayOrder;
        this.isCompleted = false;
    }

    public PhaseSubstage(Phase phase, String name, String description, Integer displayOrder) {
        this.phase = phase;
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.isCompleted = false;
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

    // Mark as complete
    public void markComplete(User user) {
        this.isCompleted = true;
        this.completedAt = LocalDateTime.now();
        this.completedBy = user;
    }

    // Mark as incomplete
    public void markIncomplete() {
        this.isCompleted = false;
        this.completedAt = null;
        this.completedBy = null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Phase getPhase() {
        return phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
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

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public User getCompletedBy() {
        return completedBy;
    }

    public void setCompletedBy(User completedBy) {
        this.completedBy = completedBy;
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

    // Helper to get phase ID for JSON serialization
    public Long getPhaseId() {
        return phase != null ? phase.getId() : null;
    }

    // Helper to get completed by name for JSON serialization
    public String getCompletedByName() {
        if (completedBy != null && completedBy.getName() != null) {
            return completedBy.getName();
        }
        return null;
    }
}
