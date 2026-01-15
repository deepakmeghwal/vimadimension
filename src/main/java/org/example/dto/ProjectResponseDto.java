package org.example.dto;

import org.example.models.Project;
import org.example.models.enums.ProjectChargeType;
import org.example.models.enums.ProjectPriority;
import org.example.models.enums.ProjectStage;
import org.example.models.enums.ProjectStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Project details response.
 * Financial fields are conditionally included based on user role.
 */
public class ProjectResponseDto {
    // Core project fields (always included)
    private Long id;
    private String projectNumber;
    private String name;
    private String description;
    private String location;
    
    // Client information
    private Long clientId;
    private String clientName;
    private String clientBillingAddress;
    
    // Project metadata
    private ProjectChargeType chargeType;
    private ProjectStatus status;
    private ProjectStage projectStage;
    private ProjectPriority priority;
    private List<ProjectStage> lifecycleStages;
    
    // Dates
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Organization
    private Long organizationId;
    
    // Financial fields (only included for admins)
    private BigDecimal budget;
    private BigDecimal actualCost;
    private BigDecimal totalFee;
    private BigDecimal targetProfitMargin;
    private BigDecimal productionBudget;

    public ProjectResponseDto() {}

    /**
     * Creates a ProjectResponseDto from a Project entity.
     * @param project The project entity
     * @param includeFinancials Whether to include financial fields (true for admins)
     * @return The populated DTO
     */
    public static ProjectResponseDto fromEntity(Project project, boolean includeFinancials) {
        ProjectResponseDto dto = new ProjectResponseDto();
        
        // Always include core fields
        dto.setId(project.getId());
        dto.setProjectNumber(project.getProjectNumber());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setLocation(project.getLocation());
        
        // Client information
        dto.setClientId(project.getClientId());
        dto.setClientName(project.getClientName());
        dto.setClientBillingAddress(project.getClientBillingAddress());
        
        // Project metadata
        dto.setChargeType(project.getChargeType());
        dto.setStatus(project.getStatus());
        dto.setProjectStage(project.getProjectStage());
        dto.setPriority(project.getPriority());
        dto.setLifecycleStages(project.getLifecycleStages());
        
        // Dates
        dto.setStartDate(project.getStartDate());
        dto.setEstimatedEndDate(project.getEstimatedEndDate());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        
        // Organization
        dto.setOrganizationId(project.getOrganizationId());
        
        // Financial fields - only for admins
        if (includeFinancials) {
            dto.setBudget(project.getBudget());
            dto.setActualCost(project.getActualCost());
            dto.setTotalFee(project.getTotalFee());
            dto.setTargetProfitMargin(project.getTargetProfitMargin());
            dto.setProductionBudget(project.getProductionBudget());
        }
        
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectNumber() { return projectNumber; }
    public void setProjectNumber(String projectNumber) { this.projectNumber = projectNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientBillingAddress() { return clientBillingAddress; }
    public void setClientBillingAddress(String clientBillingAddress) { this.clientBillingAddress = clientBillingAddress; }

    public ProjectChargeType getChargeType() { return chargeType; }
    public void setChargeType(ProjectChargeType chargeType) { this.chargeType = chargeType; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }

    public ProjectStage getProjectStage() { return projectStage; }
    public void setProjectStage(ProjectStage projectStage) { this.projectStage = projectStage; }

    public ProjectPriority getPriority() { return priority; }
    public void setPriority(ProjectPriority priority) { this.priority = priority; }

    public List<ProjectStage> getLifecycleStages() { return lifecycleStages; }
    public void setLifecycleStages(List<ProjectStage> lifecycleStages) { this.lifecycleStages = lifecycleStages; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEstimatedEndDate() { return estimatedEndDate; }
    public void setEstimatedEndDate(LocalDate estimatedEndDate) { this.estimatedEndDate = estimatedEndDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public BigDecimal getActualCost() { return actualCost; }
    public void setActualCost(BigDecimal actualCost) { this.actualCost = actualCost; }

    public BigDecimal getTotalFee() { return totalFee; }
    public void setTotalFee(BigDecimal totalFee) { this.totalFee = totalFee; }

    public BigDecimal getTargetProfitMargin() { return targetProfitMargin; }
    public void setTargetProfitMargin(BigDecimal targetProfitMargin) { this.targetProfitMargin = targetProfitMargin; }

    public BigDecimal getProductionBudget() { return productionBudget; }
    public void setProductionBudget(BigDecimal productionBudget) { this.productionBudget = productionBudget; }
}
