package org.example.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for project burn rate and budget status.
 * Used in Financial Resource Planning to track cost consumption.
 */
public class BurnRateDto {
    
    private BigDecimal totalFee;
    private BigDecimal targetProfitMargin;
    private BigDecimal productionBudget;  // totalFee * (1 - profitMargin)
    private BigDecimal currentBurn;       // Sum of (hours * burnRate) for all assignments
    private BigDecimal burnPercentage;
    private boolean isOverBudget;
    private String status;  // "healthy", "warning", "critical"
    private List<PhaseBurnDto> phaseBreakdown;

    public BurnRateDto() {}

    public BurnRateDto(BigDecimal totalFee, BigDecimal targetProfitMargin, 
                       BigDecimal productionBudget, BigDecimal currentBurn) {
        this.totalFee = totalFee;
        this.targetProfitMargin = targetProfitMargin;
        this.productionBudget = productionBudget;
        this.currentBurn = currentBurn;
        calculateStatusFields();
    }

    private void calculateStatusFields() {
        if (productionBudget != null && productionBudget.compareTo(BigDecimal.ZERO) > 0) {
            this.burnPercentage = currentBurn.divide(productionBudget, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            this.isOverBudget = currentBurn.compareTo(productionBudget) > 0;
            
            if (burnPercentage.compareTo(new BigDecimal("100")) > 0) {
                this.status = "critical";
            } else if (burnPercentage.compareTo(new BigDecimal("75")) > 0) {
                this.status = "warning";
            } else {
                this.status = "healthy";
            }
        } else {
            this.burnPercentage = BigDecimal.ZERO;
            this.isOverBudget = false;
            this.status = "healthy";
        }
    }

    // Getters and Setters
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

    public BigDecimal getProductionBudget() {
        return productionBudget;
    }

    public void setProductionBudget(BigDecimal productionBudget) {
        this.productionBudget = productionBudget;
    }

    public BigDecimal getCurrentBurn() {
        return currentBurn;
    }

    public void setCurrentBurn(BigDecimal currentBurn) {
        this.currentBurn = currentBurn;
        calculateStatusFields();
    }

    public BigDecimal getBurnPercentage() {
        return burnPercentage;
    }

    public void setBurnPercentage(BigDecimal burnPercentage) {
        this.burnPercentage = burnPercentage;
    }

    public boolean isOverBudget() {
        return isOverBudget;
    }

    public void setOverBudget(boolean overBudget) {
        isOverBudget = overBudget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<PhaseBurnDto> getPhaseBreakdown() {
        return phaseBreakdown;
    }

    public void setPhaseBreakdown(List<PhaseBurnDto> phaseBreakdown) {
        this.phaseBreakdown = phaseBreakdown;
    }

    /**
     * Nested DTO for per-phase burn breakdown
     */
    public static class PhaseBurnDto {
        private Long phaseId;
        private String phaseName;
        private BigDecimal phaseBudget;
        private BigDecimal phaseBurn;
        private BigDecimal burnPercentage;

        public PhaseBurnDto() {}

        public PhaseBurnDto(Long phaseId, String phaseName, BigDecimal phaseBudget, BigDecimal phaseBurn) {
            this.phaseId = phaseId;
            this.phaseName = phaseName;
            this.phaseBudget = phaseBudget;
            this.phaseBurn = phaseBurn;
            if (phaseBudget != null && phaseBudget.compareTo(BigDecimal.ZERO) > 0) {
                this.burnPercentage = phaseBurn.divide(phaseBudget, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
            } else {
                this.burnPercentage = BigDecimal.ZERO;
            }
        }

        public Long getPhaseId() { return phaseId; }
        public void setPhaseId(Long phaseId) { this.phaseId = phaseId; }
        public String getPhaseName() { return phaseName; }
        public void setPhaseName(String phaseName) { this.phaseName = phaseName; }
        public BigDecimal getPhaseBudget() { return phaseBudget; }
        public void setPhaseBudget(BigDecimal phaseBudget) { this.phaseBudget = phaseBudget; }
        public BigDecimal getPhaseBurn() { return phaseBurn; }
        public void setPhaseBurn(BigDecimal phaseBurn) { this.phaseBurn = phaseBurn; }
        public BigDecimal getBurnPercentage() { return burnPercentage; }
        public void setBurnPercentage(BigDecimal burnPercentage) { this.burnPercentage = burnPercentage; }
    }
}
