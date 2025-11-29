package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "time_logs", indexes = {
    @Index(name = "idx_timelog_user_id", columnList = "user_id"),
    @Index(name = "idx_timelog_task_id", columnList = "task_id"),
    @Index(name = "idx_timelog_date_logged", columnList = "date_logged")
})
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private User user; // The user who logged this time

    @Column(name = "date_logged", nullable = false)
    private LocalDate dateLogged; // The day the work was performed for

    @Column(name = "hours_logged", nullable = false, precision = 5, scale = 2) // e.g., 999.99 hours
    private BigDecimal hoursLogged;

    @Lob
    @Column(name = "work_description", columnDefinition = "TEXT")
    private String workDescription;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public TimeLog() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDateLogged() {
        return dateLogged;
    }

    public void setDateLogged(LocalDate dateLogged) {
        this.dateLogged = dateLogged;
    }

    public BigDecimal getHoursLogged() {
        return hoursLogged;
    }

    public void setHoursLogged(BigDecimal hoursLogged) {
        this.hoursLogged = hoursLogged;
    }

    public String getWorkDescription() {
        return workDescription;
    }

    public void setWorkDescription(String workDescription) {
        this.workDescription = workDescription;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Helper methods for safe access to related entity IDs
    public Long getTaskId() {
        return task != null ? task.getId() : null;
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TimeLog timeLog = (TimeLog) o;
        return Objects.equals(id, timeLog.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "TimeLog{" +
                "id=" + id +
                ", taskId=" + (task != null ? task.getId() : null) +
                ", userId=" + (user != null ? user.getId() : null) +
                ", dateLogged=" + dateLogged +
                ", hoursLogged=" + hoursLogged +
                '}';
    }
}