package org.example.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "monthly_price", nullable = false)
    private BigDecimal monthlyPrice;

    @Column(name = "annual_price", nullable = false)
    private BigDecimal annualPrice;

    @Column(name = "currency_code")
    private String currencyCode;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "max_projects")
    private Integer maxProjects;

    @Column(name = "storage_gb")
    private Integer storageGb;

    @Column(name = "has_financial_access")
    private Boolean hasFinancialAccess;

    @Column(name = "has_team_access")
    private Boolean hasTeamAccess;

    @Column(name = "description")
    private String description;

    @Column(name = "features_json", columnDefinition = "json")
    private String featuresJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
