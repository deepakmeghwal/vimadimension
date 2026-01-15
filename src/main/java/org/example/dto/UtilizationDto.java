package org.example.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for employee utilization tracking.
 * Checks if a resource is over-utilized (>40 hrs/week across all projects).
 */
public class UtilizationDto {
    
    private Long userId;
    private String userName;
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private Integer totalHoursPlanned;
    private Integer maxHoursPerWeek = 40;
    private boolean isOverUtilized;
    private Integer hoursOverLimit;
    private List<ProjectAllocationDto> projectAllocations;

    public UtilizationDto() {}

    public UtilizationDto(Long userId, String userName, LocalDate weekStart, Integer totalHoursPlanned) {
        this.userId = userId;
        this.userName = userName;
        this.weekStart = weekStart;
        this.weekEnd = weekStart.plusDays(6);
        this.totalHoursPlanned = totalHoursPlanned;
        this.isOverUtilized = totalHoursPlanned > maxHoursPerWeek;
        this.hoursOverLimit = Math.max(0, totalHoursPlanned - maxHoursPerWeek);
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public LocalDate getWeekStart() { return weekStart; }
    public void setWeekStart(LocalDate weekStart) { this.weekStart = weekStart; }
    
    public LocalDate getWeekEnd() { return weekEnd; }
    public void setWeekEnd(LocalDate weekEnd) { this.weekEnd = weekEnd; }
    
    public Integer getTotalHoursPlanned() { return totalHoursPlanned; }
    public void setTotalHoursPlanned(Integer totalHoursPlanned) { this.totalHoursPlanned = totalHoursPlanned; }
    
    public Integer getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(Integer maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }
    
    public boolean isOverUtilized() { return isOverUtilized; }
    public void setOverUtilized(boolean overUtilized) { isOverUtilized = overUtilized; }
    
    public Integer getHoursOverLimit() { return hoursOverLimit; }
    public void setHoursOverLimit(Integer hoursOverLimit) { this.hoursOverLimit = hoursOverLimit; }
    
    public List<ProjectAllocationDto> getProjectAllocations() { return projectAllocations; }
    public void setProjectAllocations(List<ProjectAllocationDto> projectAllocations) { this.projectAllocations = projectAllocations; }

    /**
     * Nested DTO for per-project allocation breakdown
     */
    public static class ProjectAllocationDto {
        private Long projectId;
        private String projectName;
        private Integer hoursAllocated;

        public ProjectAllocationDto() {}

        public ProjectAllocationDto(Long projectId, String projectName, Integer hoursAllocated) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.hoursAllocated = hoursAllocated;
        }

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public Integer getHoursAllocated() { return hoursAllocated; }
        public void setHoursAllocated(Integer hoursAllocated) { this.hoursAllocated = hoursAllocated; }
    }
}
