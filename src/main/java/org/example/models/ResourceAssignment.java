package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonGetter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Level 2: Resource Assignment (The Money)
 * Represents who is budgeted to work on which phase, with billing rates and planned hours.
 * This is the financial planning layer - it determines costs and capacity.
 */
@Entity
@Table(name = "resource_assignments", indexes = {
    @Index(name = "idx_resource_assignment_phase_id", columnList = "phase_id"),
    @Index(name = "idx_resource_assignment_user_id", columnList = "user_id"),
    @Index(name = "idx_resource_assignment_dates", columnList = "start_date, end_date")
})
public class ResourceAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = false)
    @JsonIgnore
    private Phase phase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "role_on_phase", length = 50)
    private String roleOnPhase; // e.g., "Senior Architect", "Job Captain", "Draftsperson"

    @Column(name = "billing_rate", precision = 10, scale = 2)
    private BigDecimal billingRate; // e.g., ₹1500/hr (overrides default user rate for this phase)

    @Column(name = "cost_rate", precision = 10, scale = 2)
    private BigDecimal costRate; // Internal cost rate for this assignment

    @Column(name = "planned_hours")
    private Integer plannedHours; // Budgeted hours for this phase

    @Column(name = "allocated_percentage", precision = 5, scale = 2)
    private BigDecimal allocatedPercentage; // e.g., 50% of time allocated to this phase

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ResourceAssignment() {}

    public ResourceAssignment(Phase phase, User user, String roleOnPhase) {
        this.phase = phase;
        this.user = user;
        this.roleOnPhase = roleOnPhase;
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

    public Phase getPhase() {
        return phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRoleOnPhase() {
        return roleOnPhase;
    }

    public void setRoleOnPhase(String roleOnPhase) {
        this.roleOnPhase = roleOnPhase;
    }

    public BigDecimal getBillingRate() {
        return billingRate;
    }

    public void setBillingRate(BigDecimal billingRate) {
        this.billingRate = billingRate;
    }

    public BigDecimal getCostRate() {
        return costRate;
    }

    public void setCostRate(BigDecimal costRate) {
        this.costRate = costRate;
    }

    public Integer getPlannedHours() {
        return plannedHours;
    }

    public void setPlannedHours(Integer plannedHours) {
        this.plannedHours = plannedHours;
    }

    public BigDecimal getAllocatedPercentage() {
        return allocatedPercentage;
    }

    public void setAllocatedPercentage(BigDecimal allocatedPercentage) {
        this.allocatedPercentage = allocatedPercentage;
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
    @JsonGetter("phaseId")
    public Long getPhaseId() {
        return phase != null ? phase.getId() : null;
    }

    @JsonGetter("phaseName")
    public String getPhaseName() {
        return phase != null ? phase.getName() : null;
    }

    @JsonGetter("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @JsonGetter("userName")
    public String getUserName() {
        return user != null ? (user.getName() != null ? user.getName() : user.getUsername()) : null;
    }

    @JsonGetter("userEmail")
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    @JsonGetter("projectId")
    public Long getProjectId() {
        return phase != null && phase.getProject() != null ? phase.getProject().getId() : null;
    }
}

