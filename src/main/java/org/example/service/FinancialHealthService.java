package org.example.service;

import org.example.dto.FinancialHealthDto;
import org.example.models.enums.InvoiceStatus;
import org.example.models.enums.ProjectChargeType;
import org.example.models.enums.ProjectStage;
import org.example.models.enums.ProjectStatus;
import org.example.repository.InvoiceRepository;
import org.example.repository.ProjectRepository;
import org.example.repository.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FinancialHealthService {

    private static final Logger logger = LoggerFactory.getLogger(FinancialHealthService.class);

    private final InvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;

    @Autowired
    public FinancialHealthService(InvoiceRepository invoiceRepository,
                                  ProjectRepository projectRepository,
                                  OrganizationRepository organizationRepository) {
        this.invoiceRepository = invoiceRepository;
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Get comprehensive financial health dashboard data for an organization.
     * This method aggregates data from active projects and their invoices.
     * Results are cached for 5 minutes to improve performance at scale.
     * 
     * @param organizationId The organization ID
     * @return FinancialHealthDto containing all metrics
     */
    @Cacheable(value = "financialHealth", key = "#organizationId", unless = "#result == null")
    public FinancialHealthDto getFinancialHealth(Long organizationId) {
        logger.info("Generating financial health dashboard for organization: {}", organizationId);
        
        // Verify organization exists
        organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        // Get overall metrics
        FinancialHealthDto.OverallMetrics overall = calculateOverallMetrics(organizationId);
        
        // Get metrics by charge type
        List<FinancialHealthDto.ChargeTypeMetrics> byChargeType = calculateChargeTypeMetrics(organizationId);
        
        // Get metrics by project stage
        List<FinancialHealthDto.ProjectStageMetrics> byProjectStage = calculateProjectStageMetrics(organizationId);
        
        // Get metrics by invoice status
        List<FinancialHealthDto.InvoiceStatusMetrics> byInvoiceStatus = calculateInvoiceStatusMetrics(organizationId);
        
        return new FinancialHealthDto(overall, byChargeType, byProjectStage, byInvoiceStatus);
    }

    private FinancialHealthDto.OverallMetrics calculateOverallMetrics(Long organizationId) {
        FinancialHealthDto.OverallMetrics metrics = new FinancialHealthDto.OverallMetrics();
        
        // Initialize with zeros to avoid null issues
        metrics.setTotalInvoices(0L);
        metrics.setTotalInvoiced(BigDecimal.ZERO);
        metrics.setTotalPaid(BigDecimal.ZERO);
        metrics.setTotalOutstanding(BigDecimal.ZERO);
        metrics.setTotalActiveProjects(0L);
        metrics.setTotalBudget(BigDecimal.ZERO);
        metrics.setTotalActualCost(BigDecimal.ZERO);
        metrics.setCollectionRate(0.0);
        
        // Get overall invoice stats - use ALL invoices for overall view, not just active projects
        // This gives a complete picture of the organization's financial health
        try {
            Object[] invoiceStats = invoiceRepository.getAllInvoiceStats(organizationId);
            if (invoiceStats != null && invoiceStats.length >= 4) {
                // Handle different possible return types from database
                Object countObj = invoiceStats[0];
                if (countObj != null) {
                    if (countObj instanceof Long) {
                        metrics.setTotalInvoices((Long) countObj);
                    } else if (countObj instanceof Number) {
                        metrics.setTotalInvoices(((Number) countObj).longValue());
                    } else {
                        metrics.setTotalInvoices(Long.parseLong(countObj.toString()));
                    }
                }
                
                metrics.setTotalInvoiced(toBigDecimal(invoiceStats[1]));
                metrics.setTotalPaid(toBigDecimal(invoiceStats[2]));
                metrics.setTotalOutstanding(toBigDecimal(invoiceStats[3]));
            }
        } catch (Exception e) {
            logger.error("Error fetching overall invoice stats for organization {}: {}", organizationId, e.getMessage(), e);
        }
        
        // Get active project count (using single query to avoid double counting)
        try {
            metrics.setTotalActiveProjects(projectRepository.countActiveProjectsByOrganization(organizationId));
        } catch (Exception e) {
            logger.error("Error counting active projects for organization {}: {}", organizationId, e.getMessage(), e);
        }
        
        // Calculate collection rate
        if (metrics.getTotalInvoiced() != null && 
            metrics.getTotalInvoiced().compareTo(BigDecimal.ZERO) > 0) {
            try {
                double rate = metrics.getTotalPaid()
                        .divide(metrics.getTotalInvoiced(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                metrics.setCollectionRate(rate);
            } catch (Exception e) {
                logger.error("Error calculating collection rate: {}", e.getMessage());
                metrics.setCollectionRate(0.0);
            }
        }
        
        // Get budget and actual cost for active projects
        try {
            Object[] budgetStats = projectRepository.getBudgetStatsForActiveProjects(organizationId);
            if (budgetStats != null && budgetStats.length >= 2) {
                metrics.setTotalBudget(toBigDecimal(budgetStats[0]));
                metrics.setTotalActualCost(toBigDecimal(budgetStats[1]));
            }
        } catch (Exception e) {
            logger.error("Error fetching budget stats for organization {}: {}", organizationId, e.getMessage(), e);
        }
        
        return metrics;
    }

    private List<FinancialHealthDto.ChargeTypeMetrics> calculateChargeTypeMetrics(Long organizationId) {
        // Get project counts by charge type
        List<Object[]> projectCounts = projectRepository.getActiveProjectCountByChargeType(organizationId);
        Map<String, Long> projectCountMap = new HashMap<>();
        for (Object[] row : projectCounts) {
            if (row[0] != null) {
                projectCountMap.put(row[0].toString(), ((Long) row[1]));
            }
        }
        
        // Get invoice stats by charge type
        List<Object[]> invoiceStats = invoiceRepository.getInvoiceStatsByChargeType(organizationId);
        List<FinancialHealthDto.ChargeTypeMetrics> metricsList = new ArrayList<>();
        
        // Create a map to aggregate data
        Map<String, FinancialHealthDto.ChargeTypeMetrics> metricsMap = new HashMap<>();
        
        for (Object[] stat : invoiceStats) {
            if (stat[0] == null) continue;
            
            String chargeType = stat[0].toString();
            long invoiceCount = ((Long) stat[1]);
            BigDecimal totalInvoiced = toBigDecimal(stat[2]);
            BigDecimal totalPaid = toBigDecimal(stat[3]);
            BigDecimal totalOutstanding = toBigDecimal(stat[4]);
            
            FinancialHealthDto.ChargeTypeMetrics metrics = metricsMap.getOrDefault(chargeType,
                    new FinancialHealthDto.ChargeTypeMetrics());
            metrics.setChargeType(chargeType);
            metrics.setChargeTypeDisplay(getChargeTypeDisplay(chargeType));
            metrics.setInvoiceCount(metrics.getInvoiceCount() + invoiceCount);
            metrics.setTotalInvoiced(metrics.getTotalInvoiced() != null ? 
                    metrics.getTotalInvoiced().add(totalInvoiced) : totalInvoiced);
            metrics.setTotalPaid(metrics.getTotalPaid() != null ? 
                    metrics.getTotalPaid().add(totalPaid) : totalPaid);
            metrics.setTotalOutstanding(metrics.getTotalOutstanding() != null ? 
                    metrics.getTotalOutstanding().add(totalOutstanding) : totalOutstanding);
            
            metricsMap.put(chargeType, metrics);
        }
        
        // Set project counts
        for (Map.Entry<String, Long> entry : projectCountMap.entrySet()) {
            FinancialHealthDto.ChargeTypeMetrics metrics = metricsMap.getOrDefault(entry.getKey(),
                    new FinancialHealthDto.ChargeTypeMetrics());
            metrics.setChargeType(entry.getKey());
            metrics.setChargeTypeDisplay(getChargeTypeDisplay(entry.getKey()));
            metrics.setProjectCount(entry.getValue());
            metricsMap.put(entry.getKey(), metrics);
        }
        
        // Calculate collection rates and convert to list
        for (FinancialHealthDto.ChargeTypeMetrics metrics : metricsMap.values()) {
            if (metrics.getTotalInvoiced() != null && 
                metrics.getTotalInvoiced().compareTo(BigDecimal.ZERO) > 0) {
                double rate = metrics.getTotalPaid()
                        .divide(metrics.getTotalInvoiced(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                metrics.setCollectionRate(rate);
            }
            metricsList.add(metrics);
        }
        
        return metricsList;
    }

    private List<FinancialHealthDto.ProjectStageMetrics> calculateProjectStageMetrics(Long organizationId) {
        // Get project counts by stage
        List<Object[]> projectCounts = projectRepository.getActiveProjectCountByStage(organizationId);
        Map<String, Long> projectCountMap = new HashMap<>();
        for (Object[] row : projectCounts) {
            if (row[0] != null) {
                projectCountMap.put(row[0].toString(), ((Long) row[1]));
            }
        }
        
        // Get invoice stats by project stage
        List<Object[]> invoiceStats = invoiceRepository.getInvoiceStatsByProjectStage(organizationId);
        Map<String, FinancialHealthDto.ProjectStageMetrics> metricsMap = new HashMap<>();
        
        for (Object[] stat : invoiceStats) {
            if (stat[0] == null) continue;
            
            String stage = stat[0].toString();
            long invoiceCount = ((Long) stat[1]);
            BigDecimal totalInvoiced = toBigDecimal(stat[2]);
            BigDecimal totalPaid = toBigDecimal(stat[3]);
            BigDecimal totalOutstanding = toBigDecimal(stat[4]);
            
            FinancialHealthDto.ProjectStageMetrics metrics = metricsMap.getOrDefault(stage,
                    new FinancialHealthDto.ProjectStageMetrics());
            metrics.setStage(stage);
            metrics.setStageDisplay(getStageDisplay(stage));
            metrics.setInvoiceCount(metrics.getInvoiceCount() + invoiceCount);
            metrics.setTotalInvoiced(metrics.getTotalInvoiced() != null ? 
                    metrics.getTotalInvoiced().add(totalInvoiced) : totalInvoiced);
            metrics.setTotalPaid(metrics.getTotalPaid() != null ? 
                    metrics.getTotalPaid().add(totalPaid) : totalPaid);
            metrics.setTotalOutstanding(metrics.getTotalOutstanding() != null ? 
                    metrics.getTotalOutstanding().add(totalOutstanding) : totalOutstanding);
            
            metricsMap.put(stage, metrics);
        }
        
        // Set project counts
        for (Map.Entry<String, Long> entry : projectCountMap.entrySet()) {
            FinancialHealthDto.ProjectStageMetrics metrics = metricsMap.getOrDefault(entry.getKey(),
                    new FinancialHealthDto.ProjectStageMetrics());
            metrics.setStage(entry.getKey());
            metrics.setStageDisplay(getStageDisplay(entry.getKey()));
            metrics.setProjectCount(entry.getValue());
            metricsMap.put(entry.getKey(), metrics);
        }
        
        // Calculate collection rates and convert to list
        List<FinancialHealthDto.ProjectStageMetrics> metricsList = new ArrayList<>();
        for (FinancialHealthDto.ProjectStageMetrics metrics : metricsMap.values()) {
            if (metrics.getTotalInvoiced() != null && 
                metrics.getTotalInvoiced().compareTo(BigDecimal.ZERO) > 0) {
                double rate = metrics.getTotalPaid()
                        .divide(metrics.getTotalInvoiced(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                metrics.setCollectionRate(rate);
            }
            metricsList.add(metrics);
        }
        
        return metricsList;
    }

    private List<FinancialHealthDto.InvoiceStatusMetrics> calculateInvoiceStatusMetrics(Long organizationId) {
        List<Object[]> invoiceStats = invoiceRepository.getInvoiceStatsByStatusForActiveProjects(organizationId);
        List<FinancialHealthDto.InvoiceStatusMetrics> metricsList = new ArrayList<>();
        
        for (Object[] stat : invoiceStats) {
            if (stat[0] == null) continue;
            
            FinancialHealthDto.InvoiceStatusMetrics metrics = new FinancialHealthDto.InvoiceStatusMetrics();
            String status = stat[0].toString();
            metrics.setStatus(status);
            metrics.setStatusDisplay(getStatusDisplay(status));
            metrics.setCount(((Long) stat[1]));
            metrics.setTotalAmount(toBigDecimal(stat[2]));
            metrics.setPaidAmount(toBigDecimal(stat[3]));
            metrics.setOutstandingAmount(toBigDecimal(stat[4]));
            
            metricsList.add(metrics);
        }
        
        return metricsList;
    }


    // Helper methods for display names
    private String getChargeTypeDisplay(String chargeType) {
        try {
            return ProjectChargeType.valueOf(chargeType).getDisplayName();
        } catch (IllegalArgumentException e) {
            return chargeType;
        }
    }

    private String getStageDisplay(String stage) {
        try {
            return ProjectStage.valueOf(stage).getDisplayName();
        } catch (IllegalArgumentException e) {
            return stage;
        }
    }

    private String getStatusDisplay(String status) {
        try {
            return InvoiceStatus.valueOf(status).getDisplayName();
        } catch (IllegalArgumentException e) {
            return status;
        }
    }

    // Helper method to safely convert Object to BigDecimal
    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Double) {
            return BigDecimal.valueOf((Double) value);
        }
        if (value instanceof Long) {
            return BigDecimal.valueOf((Long) value);
        }
        if (value instanceof Integer) {
            return BigDecimal.valueOf((Integer) value);
        }
        try {
            return new BigDecimal(value.toString());
        } catch (Exception e) {
            logger.warn("Could not convert {} to BigDecimal", value);
            return BigDecimal.ZERO;
        }
    }
}

