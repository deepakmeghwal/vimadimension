package org.example.dto;

import org.example.models.Phase;
import org.example.models.PhaseSubstage;
import org.example.models.enums.PhaseStatus;
import org.example.models.enums.PhaseType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for Phase details response.
 * Financial field (contractAmount) is conditionally included based on user role.
 */
public class PhaseResponseDto {
    // Core phase fields (always included)
    private Long id;
    private String phaseNumber;
    private String name;
    private PhaseType phaseType;
    private PhaseStatus status;
    
    // Dates
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Substages
    private List<SubstageDto> substages;
    
    // Completion status (computed from substages)
    private CompletionStatusDto completionStatus;
    
    // Financial fields (only included for admins)
    private BigDecimal contractAmount;

    public PhaseResponseDto() {}

    /**
     * Creates a PhaseResponseDto from a Phase entity.
     * @param phase The phase entity
     * @param includeFinancials Whether to include financial fields (true for admins)
     * @return The populated DTO
     */
    public static PhaseResponseDto fromEntity(Phase phase, boolean includeFinancials) {
        PhaseResponseDto dto = new PhaseResponseDto();
        
        // Always include core fields
        dto.setId(phase.getId());
        dto.setPhaseNumber(phase.getPhaseNumber());
        dto.setName(phase.getName());
        dto.setPhaseType(phase.getPhaseType());
        dto.setStatus(phase.getStatus());
        
        // Dates
        dto.setStartDate(phase.getStartDate());
        dto.setEndDate(phase.getEndDate());
        dto.setCreatedAt(phase.getCreatedAt());
        dto.setUpdatedAt(phase.getUpdatedAt());
        
        // Substages
        List<SubstageDto> substageDtos;
        if (phase.getSubstages() != null) {
            substageDtos = phase.getSubstages().stream()
                    .map(SubstageDto::fromEntity)
                    .collect(Collectors.toList());
        } else {
            substageDtos = new ArrayList<>();
        }
        dto.setSubstages(substageDtos);
        
        // Compute completion status
        dto.setCompletionStatus(CompletionStatusDto.fromSubstages(substageDtos));
        
        
        // Financial fields - only for admins
        if (includeFinancials) {
            dto.setContractAmount(phase.getContractAmount());
        }
        
        return dto;
    }

    /**
     * Converts a list of Phase entities to PhaseResponseDto list.
     */
    public static List<PhaseResponseDto> fromEntities(List<Phase> phases, boolean includeFinancials) {
        if (phases == null) {
            return new ArrayList<>();
        }
        return phases.stream()
                .map(phase -> fromEntity(phase, includeFinancials))
                .collect(Collectors.toList());
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhaseNumber() { return phaseNumber; }
    public void setPhaseNumber(String phaseNumber) { this.phaseNumber = phaseNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PhaseType getPhaseType() { return phaseType; }
    public void setPhaseType(PhaseType phaseType) { this.phaseType = phaseType; }

    public PhaseStatus getStatus() { return status; }
    public void setStatus(PhaseStatus status) { this.status = status; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<SubstageDto> getSubstages() { return substages; }
    public void setSubstages(List<SubstageDto> substages) { this.substages = substages; }

    public CompletionStatusDto getCompletionStatus() { return completionStatus; }
    public void setCompletionStatus(CompletionStatusDto completionStatus) { this.completionStatus = completionStatus; }

    public BigDecimal getContractAmount() { return contractAmount; }
    public void setContractAmount(BigDecimal contractAmount) { this.contractAmount = contractAmount; }

    /**
     * DTO for phase completion status.
     */
    public static class CompletionStatusDto {
        private int total;
        private int completed;
        private double percentage;
        private boolean allComplete;

        public static CompletionStatusDto fromSubstages(List<SubstageDto> substages) {
            CompletionStatusDto dto = new CompletionStatusDto();
            int total = substages != null ? substages.size() : 0;
            int completed = substages != null ? 
                (int) substages.stream().filter(SubstageDto::isCompleted).count() : 0;
            
            dto.setTotal(total);
            dto.setCompleted(completed);
            dto.setPercentage(total > 0 ? Math.round((completed * 100.0 / total) * 100.0) / 100.0 : 0.0);
            dto.setAllComplete(total > 0 && completed == total);
            return dto;
        }

        // Getters and Setters
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }

        public int getCompleted() { return completed; }
        public void setCompleted(int completed) { this.completed = completed; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public boolean isAllComplete() { return allComplete; }
        public void setAllComplete(boolean allComplete) { this.allComplete = allComplete; }
    }

    /**
     * Inner DTO for PhaseSubstage to avoid exposing the full entity.
     * Includes all fields to eliminate need for separate substage API calls.
     */
    public static class SubstageDto {
        private Long id;
        private String name;
        private String description;
        private Integer displayOrder;
        private boolean completed;
        private LocalDateTime completedAt;
        private String completedByName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static SubstageDto fromEntity(PhaseSubstage substage) {
            SubstageDto dto = new SubstageDto();
            dto.setId(substage.getId());
            dto.setName(substage.getName());
            dto.setDescription(substage.getDescription());
            dto.setDisplayOrder(substage.getDisplayOrder());
            dto.setCompleted(substage.getIsCompleted() != null && substage.getIsCompleted());
            dto.setCompletedAt(substage.getCompletedAt());
            dto.setCompletedByName(substage.getCompletedByName());
            dto.setCreatedAt(substage.getCreatedAt());
            dto.setUpdatedAt(substage.getUpdatedAt());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

        public String getCompletedByName() { return completedByName; }
        public void setCompletedByName(String completedByName) { this.completedByName = completedByName; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}

