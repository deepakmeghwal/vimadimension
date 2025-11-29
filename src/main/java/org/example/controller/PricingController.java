package org.example.controller;

import org.example.dto.SubscriptionPlanDTO;
import org.example.models.SubscriptionPlan;
import org.example.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plans")
public class PricingController {

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @GetMapping
    public ResponseEntity<List<SubscriptionPlanDTO>> getAllPlans() {
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();
        List<SubscriptionPlanDTO> planDTOs = plans.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(planDTOs);
    }

    private SubscriptionPlanDTO convertToDTO(SubscriptionPlan plan) {
        SubscriptionPlanDTO dto = new SubscriptionPlanDTO();
        dto.setPlanId(plan.getPlanId());
        dto.setPlanName(plan.getPlanName());
        dto.setMonthlyPrice(plan.getMonthlyPrice());
        dto.setAnnualPrice(plan.getAnnualPrice());
        dto.setCurrencyCode(plan.getCurrencyCode());
        dto.setMaxUsers(plan.getMaxUsers());
        dto.setMaxProjects(plan.getMaxProjects());
        dto.setStorageGb(plan.getStorageGb());
        dto.setHasFinancialAccess(plan.getHasFinancialAccess());
        dto.setHasTeamAccess(plan.getHasTeamAccess());
        dto.setDescription(plan.getDescription());
        dto.setFeaturesJson(plan.getFeaturesJson());
        return dto;
    }
}
