package org.example.dto;

import org.example.models.enums.ProjectChargeType;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectStage;
import org.example.models.enums.ProjectPriority;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ProjectCreateDto {
    private String name;
    private String projectNumber;
    private Long clientId;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private String location;
    private ProjectChargeType chargeType;
    private ProjectStatus status;
    private ProjectStage projectStage;
    private String description;
    
    // --- NEW CRITICAL FIELDS ---
    private BigDecimal budget;
    private BigDecimal actualCost;
    private BigDecimal totalFee;
    private BigDecimal targetProfitMargin;
    private ProjectPriority priority;
    
    private java.util.List<ProjectStage> lifecycleStages;

    // Constructors
    public ProjectCreateDto() {
    }

    public ProjectCreateDto(String name, String projectNumber, Long clientId, LocalDate startDate, LocalDate estimatedEndDate, 
                          String location, ProjectChargeType chargeType, ProjectStatus status, 
                          ProjectStage projectStage, String description, BigDecimal budget, 
                          BigDecimal actualCost, ProjectPriority priority) {
        this.name = name;
        this.projectNumber = projectNumber;
        this.clientId = clientId;
        this.startDate = startDate;
        this.estimatedEndDate = estimatedEndDate;
        this.location = location;
        this.chargeType = chargeType;
        this.status = status;
        this.projectStage = projectStage;
        this.description = description;
        this.budget = budget;
        this.actualCost = actualCost;
        this.priority = priority;
    }

    // --- NEW GETTERS AND SETTERS FOR CRITICAL FIELDS ---
    
    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getActualCost() {
        return actualCost;
    }

    public void setActualCost(BigDecimal actualCost) {
        this.actualCost = actualCost;
    }

    public BigDecimal getTotalFee() {
        return totalFee;
    }

    public void setTotalFee(BigDecimal totalFee) {
        this.totalFee = totalFee;
    }

    public BigDecimal getTargetProfitMargin() {
        return targetProfitMargin;
    }

    public void setTargetProfitMargin(BigDecimal targetProfitMargin) {
        this.targetProfitMargin = targetProfitMargin;
    }

    public ProjectPriority getPriority() {
        return priority;
    }

    public void setPriority(ProjectPriority priority) {
        this.priority = priority;
    }

    public java.util.List<ProjectStage> getLifecycleStages() {
        return lifecycleStages;
    }

    public void setLifecycleStages(java.util.List<ProjectStage> lifecycleStages) {
        this.lifecycleStages = lifecycleStages;
    }

    // --- EXISTING GETTERS AND SETTERS ---
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProjectNumber() {
        return projectNumber;
    }

    public void setProjectNumber(String projectNumber) {
        this.projectNumber = projectNumber;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEstimatedEndDate() {
        return estimatedEndDate;
    }

    public void setEstimatedEndDate(LocalDate estimatedEndDate) {
        this.estimatedEndDate = estimatedEndDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ProjectChargeType getChargeType() {
        return chargeType;
    }

    public void setChargeType(ProjectChargeType chargeType) {
        this.chargeType = chargeType;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public ProjectStage getProjectStage() {
        return projectStage;
    }

    public void setProjectStage(ProjectStage projectStage) {
        this.projectStage = projectStage;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}