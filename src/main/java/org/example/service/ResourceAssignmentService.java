package org.example.service;

import org.example.models.Phase;
import org.example.models.ResourceAssignment;
import org.example.models.User;
import org.example.repository.ResourceAssignmentRepository;
import org.example.repository.PhaseRepository;
import org.example.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing Level 2: Resource Assignments (Phase-level resource planning)
 * This handles who is budgeted to work on which phase, with billing rates and planned hours.
 */
@Service
public class ResourceAssignmentService {

    private static final Logger logger = LoggerFactory.getLogger(ResourceAssignmentService.class);

    private final ResourceAssignmentRepository resourceAssignmentRepository;
    private final PhaseRepository phaseRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Autowired
    public ResourceAssignmentService(
            ResourceAssignmentRepository resourceAssignmentRepository,
            PhaseRepository phaseRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.resourceAssignmentRepository = resourceAssignmentRepository;
        this.phaseRepository = phaseRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("No authenticated user found.");
        }
        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user '" + username + "' not found in database."));
    }

    /**
     * Create a new resource assignment for a phase
     */
    @Transactional
    public ResourceAssignment createResourceAssignment(
            Long phaseId,
            Long userId,
            String roleOnPhase,
            BigDecimal billingRate,
            BigDecimal costRate,
            Integer plannedHours,
            BigDecimal allocatedPercentage,
            LocalDate startDate,
            LocalDate endDate) {
        
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found with ID: " + phaseId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Validate organization match
        if (user.getOrganization() == null || phase.getProject().getOrganization() == null) {
            throw new IllegalStateException("User and project must belong to an organization");
        }
        
        if (!user.getOrganization().getId().equals(phase.getProject().getOrganization().getId())) {
            throw new IllegalArgumentException("User must belong to the same organization as the project");
        }
        
        // Check if assignment already exists
        if (resourceAssignmentRepository.existsByPhase_IdAndUser_Id(phaseId, userId)) {
            throw new IllegalArgumentException("User is already assigned to this phase");
        }
        
        // Calculate rates from User profile if not provided
        BigDecimal calculatedCostRate = calculateHourlyCost(user);
        BigDecimal calculatedBurnRate = calculateBurnRate(calculatedCostRate, user);

        // If rates are not provided, use calculated ones. 
        // If provided (e.g. override), use provided ones.
        if (billingRate == null) {
            billingRate = calculatedBurnRate;
        }
        if (costRate == null) {
            costRate = calculatedCostRate;
        }

        ResourceAssignment assignment = new ResourceAssignment(phase, user, roleOnPhase);
        assignment.setBillingRate(billingRate);
        assignment.setCostRate(costRate);
        assignment.setPlannedHours(plannedHours);
        assignment.setAllocatedPercentage(allocatedPercentage);
        assignment.setStartDate(startDate);
        assignment.setEndDate(endDate);
        
        ResourceAssignment saved = resourceAssignmentRepository.save(assignment);
        
        User currentUser = getCurrentAuthenticatedUser();
        auditService.logChange(currentUser, "RESOURCE_ASSIGNMENT", saved.getId(), "CREATE", 
                null, null, String.format("Resource assignment created: %s on %s", user.getUsername(), phase.getName()));
        
        logger.info("Resource assignment created: User {} assigned to Phase {} with role {}", 
                user.getUsername(), phase.getName(), roleOnPhase);
        
        return saved;
    }

    /**
     * Update an existing resource assignment
     */
    @Transactional
    public ResourceAssignment updateResourceAssignment(
            Long assignmentId,
            String roleOnPhase,
            BigDecimal billingRate,
            BigDecimal costRate,
            Integer plannedHours,
            BigDecimal allocatedPercentage,
            LocalDate startDate,
            LocalDate endDate) {
        
        ResourceAssignment assignment = resourceAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Resource assignment not found with ID: " + assignmentId));
        
        if (roleOnPhase != null) {
            assignment.setRoleOnPhase(roleOnPhase);
        }
        if (billingRate != null) {
            assignment.setBillingRate(billingRate);
        } else if (assignment.getBillingRate() == null) {
             // Recalculate if missing and not provided
             User user = assignment.getUser();
             BigDecimal cost = calculateHourlyCost(user);
             assignment.setBillingRate(calculateBurnRate(cost, user));
        }

        if (costRate != null) {
            assignment.setCostRate(costRate);
        } else if (assignment.getCostRate() == null) {
             // Recalculate if missing and not provided
             User user = assignment.getUser();
             assignment.setCostRate(calculateHourlyCost(user));
        }
        if (plannedHours != null) {
            assignment.setPlannedHours(plannedHours);
        }
        if (allocatedPercentage != null) {
            assignment.setAllocatedPercentage(allocatedPercentage);
        }
        if (startDate != null) {
            assignment.setStartDate(startDate);
        }
        if (endDate != null) {
            assignment.setEndDate(endDate);
        }
        
        ResourceAssignment saved = resourceAssignmentRepository.save(assignment);
        
        User currentUser = getCurrentAuthenticatedUser();
        auditService.logChange(currentUser, "RESOURCE_ASSIGNMENT", saved.getId(), "UPDATE", 
                null, null, "Resource assignment updated");
        
        return saved;
    }

    /**
     * Delete a resource assignment
     */
    @Transactional
    public void deleteResourceAssignment(Long assignmentId) {
        ResourceAssignment assignment = resourceAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Resource assignment not found with ID: " + assignmentId));
        
        User currentUser = getCurrentAuthenticatedUser();
        auditService.logChange(currentUser, "RESOURCE_ASSIGNMENT", assignmentId, "DELETE", 
                null, null, "Resource assignment deleted");
        
        resourceAssignmentRepository.delete(assignment);
        logger.info("Resource assignment deleted: ID {}", assignmentId);
    }

    /**
     * Get all resource assignments for a phase
     */
    @Transactional(readOnly = true)
    public List<ResourceAssignment> getResourceAssignmentsByPhase(Long phaseId) {
        return resourceAssignmentRepository.findByPhase_Id(phaseId);
    }

    /**
     * Get all resource assignments for a project (across all phases)
     */
    @Transactional(readOnly = true)
    public List<ResourceAssignment> getResourceAssignmentsByProject(Long projectId) {
        return resourceAssignmentRepository.findByProjectId(projectId);
    }

    /**
     * Get resource assignment by phase and user
     */
    @Transactional(readOnly = true)
    public Optional<ResourceAssignment> getResourceAssignmentByPhaseAndUser(Long phaseId, Long userId) {
        return resourceAssignmentRepository.findByPhase_IdAndUser_Id(phaseId, userId);
    }

    /**
     * Get all resource assignments for a user
     */
    @Transactional(readOnly = true)
    public List<ResourceAssignment> getResourceAssignmentsByUser(Long userId) {
        return resourceAssignmentRepository.findByUser_Id(userId);
    }
    private BigDecimal calculateHourlyCost(User user) {
        if (user.getMonthlySalary() == null || user.getTypicalHoursPerMonth() == null || user.getTypicalHoursPerMonth() == 0) {
            return BigDecimal.ZERO;
        }
        return user.getMonthlySalary().divide(new BigDecimal(user.getTypicalHoursPerMonth()), 2, java.math.RoundingMode.HALF_UP);
    }

    private BigDecimal calculateBurnRate(BigDecimal hourlyCost, User user) {
        if (hourlyCost == null || user.getOverheadMultiplier() == null) {
            return hourlyCost;
        }
        return hourlyCost.multiply(user.getOverheadMultiplier());
    }

    /**
     * Get availability and budget info for a user on a phase
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getAssignmentAvailability(Long phaseId, Long userId) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. Calculate User's Burn Rate
        BigDecimal hourlyCost = calculateHourlyCost(user);
        BigDecimal burnRate = calculateBurnRate(hourlyCost, user);

        // 2. Calculate Phase Budget & Remaining
        BigDecimal totalBudget = phase.getContractAmount() != null ? phase.getContractAmount() : BigDecimal.ZERO;
        
        List<ResourceAssignment> phaseAssignments = resourceAssignmentRepository.findByPhase_Id(phaseId);
        BigDecimal currentBurn = BigDecimal.ZERO;
        
        for (ResourceAssignment assignment : phaseAssignments) {
            // Skip if we are checking for an existing assignment (to avoid double counting if needed, but here we want total used)
            // Actually, if we are editing, we might want to exclude the current assignment, but this is a general check.
            // Let's calculate total USED budget.
            BigDecimal rate = assignment.getBillingRate() != null ? assignment.getBillingRate() : BigDecimal.ZERO;
            BigDecimal hours = assignment.getPlannedHours() != null ? new BigDecimal(assignment.getPlannedHours()) : BigDecimal.ZERO;
            currentBurn = currentBurn.add(rate.multiply(hours));
        }
        
        BigDecimal remainingBudget = totalBudget.subtract(currentBurn);
        
        // 3. Max Hours allowed by Budget
        Integer maxHoursByBudget = 0;
        if (burnRate.compareTo(BigDecimal.ZERO) > 0) {
            maxHoursByBudget = remainingBudget.divide(burnRate, 0, java.math.RoundingMode.DOWN).intValue();
        }
        
        // 4. Total Hours assigned to User in this Project
        List<ResourceAssignment> projectAssignments = resourceAssignmentRepository.findByProjectId(phase.getProject().getId());
        Integer totalProjectHours = 0;
        for (ResourceAssignment assignment : projectAssignments) {
            if (assignment.getUser().getId().equals(userId)) {
                totalProjectHours += (assignment.getPlannedHours() != null ? assignment.getPlannedHours() : 0);
            }
        }

        return java.util.Map.of(
            "burnRate", burnRate,
            "totalBudget", totalBudget,
            "remainingBudget", remainingBudget,
            "maxHoursByBudget", maxHoursByBudget,
            "currentProjectLoad", totalProjectHours,
            "user", java.util.Map.of(
                "id", user.getId(),
                "name", user.getName() != null ? user.getName() : user.getUsername()
            )
        );
    }
}

