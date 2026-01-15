package org.example.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class FinancialHealthDto {
    
    private OverallMetrics overall;
    private List<ChargeTypeMetrics> byChargeType;
    private List<ProjectStageMetrics> byProjectStage;
    private List<InvoiceStatusMetrics> byInvoiceStatus;
    
    // Constructors
    public FinancialHealthDto() {
    }
    
    public FinancialHealthDto(OverallMetrics overall, List<ChargeTypeMetrics> byChargeType,
                             List<ProjectStageMetrics> byProjectStage, 
                             List<InvoiceStatusMetrics> byInvoiceStatus) {
        this.overall = overall;
        this.byChargeType = byChargeType;
        this.byProjectStage = byProjectStage;
        this.byInvoiceStatus = byInvoiceStatus;
    }
    
    // Getters and Setters
    public OverallMetrics getOverall() {
        return overall;
    }
    
    public void setOverall(OverallMetrics overall) {
        this.overall = overall;
    }
    
    public List<ChargeTypeMetrics> getByChargeType() {
        return byChargeType;
    }
    
    public void setByChargeType(List<ChargeTypeMetrics> byChargeType) {
        this.byChargeType = byChargeType;
    }
    
    public List<ProjectStageMetrics> getByProjectStage() {
        return byProjectStage;
    }
    
    public void setByProjectStage(List<ProjectStageMetrics> byProjectStage) {
        this.byProjectStage = byProjectStage;
    }
    
    public List<InvoiceStatusMetrics> getByInvoiceStatus() {
        return byInvoiceStatus;
    }
    
    public void setByInvoiceStatus(List<InvoiceStatusMetrics> byInvoiceStatus) {
        this.byInvoiceStatus = byInvoiceStatus;
    }
    
    // Nested classes for different metric types
    public static class OverallMetrics {
        private long totalActiveProjects;
        private long totalInvoices;
        private BigDecimal totalInvoiced;
        private BigDecimal totalPaid;
        private BigDecimal totalOutstanding;
        private BigDecimal totalBudget;
        private BigDecimal totalActualCost;
        private double collectionRate; // Percentage
        
        public OverallMetrics() {
        }
        
        // Getters and Setters
        public long getTotalActiveProjects() {
            return totalActiveProjects;
        }
        
        public void setTotalActiveProjects(long totalActiveProjects) {
            this.totalActiveProjects = totalActiveProjects;
        }
        
        public long getTotalInvoices() {
            return totalInvoices;
        }
        
        public void setTotalInvoices(long totalInvoices) {
            this.totalInvoices = totalInvoices;
        }
        
        public BigDecimal getTotalInvoiced() {
            return totalInvoiced;
        }
        
        public void setTotalInvoiced(BigDecimal totalInvoiced) {
            this.totalInvoiced = totalInvoiced;
        }
        
        public BigDecimal getTotalPaid() {
            return totalPaid;
        }
        
        public void setTotalPaid(BigDecimal totalPaid) {
            this.totalPaid = totalPaid;
        }
        
        public BigDecimal getTotalOutstanding() {
            return totalOutstanding;
        }
        
        public void setTotalOutstanding(BigDecimal totalOutstanding) {
            this.totalOutstanding = totalOutstanding;
        }
        
        public BigDecimal getTotalBudget() {
            return totalBudget;
        }
        
        public void setTotalBudget(BigDecimal totalBudget) {
            this.totalBudget = totalBudget;
        }
        
        public BigDecimal getTotalActualCost() {
            return totalActualCost;
        }
        
        public void setTotalActualCost(BigDecimal totalActualCost) {
            this.totalActualCost = totalActualCost;
        }
        
        public double getCollectionRate() {
            return collectionRate;
        }
        
        public void setCollectionRate(double collectionRate) {
            this.collectionRate = collectionRate;
        }
    }
    
    public static class ChargeTypeMetrics {
        private String chargeType;
        private String chargeTypeDisplay;
        private long projectCount;
        private long invoiceCount;
        private BigDecimal totalInvoiced;
        private BigDecimal totalPaid;
        private BigDecimal totalOutstanding;
        private double collectionRate;
        
        public ChargeTypeMetrics() {
        }
        
        // Getters and Setters
        public String getChargeType() {
            return chargeType;
        }
        
        public void setChargeType(String chargeType) {
            this.chargeType = chargeType;
        }
        
        public String getChargeTypeDisplay() {
            return chargeTypeDisplay;
        }
        
        public void setChargeTypeDisplay(String chargeTypeDisplay) {
            this.chargeTypeDisplay = chargeTypeDisplay;
        }
        
        public long getProjectCount() {
            return projectCount;
        }
        
        public void setProjectCount(long projectCount) {
            this.projectCount = projectCount;
        }
        
        public long getInvoiceCount() {
            return invoiceCount;
        }
        
        public void setInvoiceCount(long invoiceCount) {
            this.invoiceCount = invoiceCount;
        }
        
        public BigDecimal getTotalInvoiced() {
            return totalInvoiced;
        }
        
        public void setTotalInvoiced(BigDecimal totalInvoiced) {
            this.totalInvoiced = totalInvoiced;
        }
        
        public BigDecimal getTotalPaid() {
            return totalPaid;
        }
        
        public void setTotalPaid(BigDecimal totalPaid) {
            this.totalPaid = totalPaid;
        }
        
        public BigDecimal getTotalOutstanding() {
            return totalOutstanding;
        }
        
        public void setTotalOutstanding(BigDecimal totalOutstanding) {
            this.totalOutstanding = totalOutstanding;
        }
        
        public double getCollectionRate() {
            return collectionRate;
        }
        
        public void setCollectionRate(double collectionRate) {
            this.collectionRate = collectionRate;
        }
    }
    
    public static class ProjectStageMetrics {
        private String stage;
        private String stageDisplay;
        private long projectCount;
        private long invoiceCount;
        private BigDecimal totalInvoiced;
        private BigDecimal totalPaid;
        private BigDecimal totalOutstanding;
        private double collectionRate;
        
        public ProjectStageMetrics() {
        }
        
        // Getters and Setters
        public String getStage() {
            return stage;
        }
        
        public void setStage(String stage) {
            this.stage = stage;
        }
        
        public String getStageDisplay() {
            return stageDisplay;
        }
        
        public void setStageDisplay(String stageDisplay) {
            this.stageDisplay = stageDisplay;
        }
        
        public long getProjectCount() {
            return projectCount;
        }
        
        public void setProjectCount(long projectCount) {
            this.projectCount = projectCount;
        }
        
        public long getInvoiceCount() {
            return invoiceCount;
        }
        
        public void setInvoiceCount(long invoiceCount) {
            this.invoiceCount = invoiceCount;
        }
        
        public BigDecimal getTotalInvoiced() {
            return totalInvoiced;
        }
        
        public void setTotalInvoiced(BigDecimal totalInvoiced) {
            this.totalInvoiced = totalInvoiced;
        }
        
        public BigDecimal getTotalPaid() {
            return totalPaid;
        }
        
        public void setTotalPaid(BigDecimal totalPaid) {
            this.totalPaid = totalPaid;
        }
        
        public BigDecimal getTotalOutstanding() {
            return totalOutstanding;
        }
        
        public void setTotalOutstanding(BigDecimal totalOutstanding) {
            this.totalOutstanding = totalOutstanding;
        }
        
        public double getCollectionRate() {
            return collectionRate;
        }
        
        public void setCollectionRate(double collectionRate) {
            this.collectionRate = collectionRate;
        }
    }
    
    public static class InvoiceStatusMetrics {
        private String status;
        private String statusDisplay;
        private long count;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal outstandingAmount;
        
        public InvoiceStatusMetrics() {
        }
        
        // Getters and Setters
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public String getStatusDisplay() {
            return statusDisplay;
        }
        
        public void setStatusDisplay(String statusDisplay) {
            this.statusDisplay = statusDisplay;
        }
        
        public long getCount() {
            return count;
        }
        
        public void setCount(long count) {
            this.count = count;
        }
        
        public BigDecimal getTotalAmount() {
            return totalAmount;
        }
        
        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }
        
        public BigDecimal getPaidAmount() {
            return paidAmount;
        }
        
        public void setPaidAmount(BigDecimal paidAmount) {
            this.paidAmount = paidAmount;
        }
        
        public BigDecimal getOutstandingAmount() {
            return outstandingAmount;
        }
        
        public void setOutstandingAmount(BigDecimal outstandingAmount) {
            this.outstandingAmount = outstandingAmount;
        }
    }
}






