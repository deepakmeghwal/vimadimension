package org.example.dto;

import org.example.models.ProjectActivity;
import org.example.models.enums.ActivityType;
import java.time.LocalDateTime;

public class ProjectActivityDto {
    private Long id;
    private ActivityType type;
    private String description;
    private String loggedBy; // User's name or username
    private LocalDateTime time; // Activity date/time

    public ProjectActivityDto() {
    }

    public ProjectActivityDto(Long id, ActivityType type, String description, String loggedBy, LocalDateTime time) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.loggedBy = loggedBy;
        this.time = time;
    }

    // Factory method to create DTO from entity
    public static ProjectActivityDto fromEntity(ProjectActivity activity) {
        String loggedBy = activity.getUser() != null 
            ? (activity.getUser().getName() != null && !activity.getUser().getName().isEmpty() 
                ? activity.getUser().getName() 
                : activity.getUser().getUsername())
            : "Unknown";
        
        return new ProjectActivityDto(
            activity.getId(),
            activity.getType(),
            activity.getDescription(),
            loggedBy,
            activity.getActivityDate()
        );
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ActivityType getType() {
        return type;
    }

    public void setType(ActivityType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLoggedBy() {
        return loggedBy;
    }

    public void setLoggedBy(String loggedBy) {
        this.loggedBy = loggedBy;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}

