package org.example.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SubscriptionPlanDTO {
    private Long planId;
    private String planName;
    private BigDecimal monthlyPrice;
    private BigDecimal annualPrice;
    private String currencyCode;
    private Integer maxUsers;
    private Integer maxProjects;
    private Integer storageGb;
    private Boolean hasFinancialAccess;
    private Boolean hasTeamAccess;
    private String description;
    private String featuresJson;
}
