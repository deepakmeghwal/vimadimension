package org.example.service;

import org.example.models.Phase;
import org.example.models.Project;
import org.example.models.User;
import org.example.models.enums.PhaseStatus;
import org.example.repository.PhaseRepository;
import org.example.repository.ProjectRepository;
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
import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Lazy;

@Service
public class PhaseService {

    private static final Logger logger = LoggerFactory.getLogger(PhaseService.class);

    private final PhaseRepository phaseRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private PhaseSubstageService substageService;

    @Autowired
    public PhaseService(PhaseRepository phaseRepository, ProjectRepository projectRepository, UserRepository userRepository, AuditService auditService) {
        this.phaseRepository = phaseRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    // Setter injection with @Lazy to avoid circular dependency
    @Autowired
    @Lazy
    public void setSubstageService(PhaseSubstageService substageService) {
        this.substageService = substageService;
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

    @Transactional
    public Phase createPhase(Long projectId, String phaseNumber, String name, BigDecimal contractAmount, PhaseStatus status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project with ID " + projectId + " not found."));

        Phase phase = new Phase();
        phase.setProject(project);
        phase.setPhaseNumber(phaseNumber);
        phase.setName(name);
        phase.setContractAmount(contractAmount);
        phase.setStatus(status != null ? status : PhaseStatus.ACTIVE);

        Phase savedPhase = phaseRepository.save(phase);
        
        User currentUser = getCurrentAuthenticatedUser();
        auditService.logChange(currentUser, "PHASE", savedPhase.getId(), "CREATE", null, null, "Phase created");

        return savedPhase;
    }

    @Transactional
    public Optional<Phase> updatePhase(Long phaseId, String phaseNumber, String name, BigDecimal contractAmount, PhaseStatus status) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Phase with ID " + phaseId + " not found."));

        User currentUser = getCurrentAuthenticatedUser();
        boolean updated = false;

        if (phaseNumber != null && !phaseNumber.equals(phase.getPhaseNumber())) {
            auditService.logChange(currentUser, "PHASE", phaseId, "UPDATE", "phaseNumber", phase.getPhaseNumber(), phaseNumber);
            phase.setPhaseNumber(phaseNumber);
            updated = true;
        }

        if (name != null && !name.equals(phase.getName())) {
            auditService.logChange(currentUser, "PHASE", phaseId, "UPDATE", "name", phase.getName(), name);
            phase.setName(name);
            updated = true;
        }

        if (contractAmount != null && !contractAmount.equals(phase.getContractAmount())) {
            auditService.logChange(currentUser, "PHASE", phaseId, "UPDATE", "contractAmount", String.valueOf(phase.getContractAmount()), String.valueOf(contractAmount));
            phase.setContractAmount(contractAmount);
            updated = true;
        }

        if (status != null && status != phase.getStatus()) {
            auditService.logChange(currentUser, "PHASE", phaseId, "UPDATE", "status", phase.getStatus().name(), status.name());
            phase.setStatus(status);
            updated = true;
        }

        if (updated) {
            return Optional.of(phaseRepository.save(phase));
        }
        return Optional.of(phase);
    }

    public List<Phase> getPhasesByProjectId(Long projectId) {
        return phaseRepository.findByProjectIdWithSubstages(projectId);
    }

    public Optional<Phase> getPhaseById(Long phaseId) {
        return phaseRepository.findById(phaseId);
    }

    /**
     * Create phases for a project based on its lifecycle stages.
     * Uses the project's lifecycleStages field (defined during project creation).
     */
    @Transactional
    public List<Phase> createStandardPhases(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project with ID " + projectId + " not found."));

        List<Phase> existingPhases = phaseRepository.findByProjectId(projectId);
        if (!existingPhases.isEmpty()) {
            throw new IllegalStateException("Project already has phases. Cannot create phases.");
        }

        // Use project's lifecycle stages
        java.util.List<org.example.models.enums.ProjectStage> lifecycleStages = project.getLifecycleStages();
        if (lifecycleStages == null || lifecycleStages.isEmpty()) {
            throw new IllegalStateException("No lifecycle stages defined for this project. Please edit the project and select stages.");
        }

        List<Phase> createdPhases = new java.util.ArrayList<>();
        User currentUser = getCurrentAuthenticatedUser();

        for (int i = 0; i < lifecycleStages.size(); i++) {
            org.example.models.enums.ProjectStage stage = lifecycleStages.get(i);
            
            Phase phase = new Phase();
            phase.setProject(project);
            phase.setPhaseNumber(String.format("%02d", i + 1));
            phase.setName(stage.getDisplayName());
            phase.setStatus(PhaseStatus.ACTIVE);

            Phase savedPhase = phaseRepository.save(phase);
            createdPhases.add(savedPhase);

            // Auto-create predefined substages for this phase
            if (substageService != null) {
                substageService.createDefaultSubstages(savedPhase);
            }

            auditService.logChange(currentUser, "PHASE", savedPhase.getId(), "CREATE", null, null, 
                    "Phase created from project lifecycle stage: " + stage.getDisplayName());
        }

        logger.info("Created {} phases from lifecycle stages for project {}", createdPhases.size(), projectId);
        return createdPhases;
    }

    @Transactional
    public boolean deletePhase(Long phaseId) {
        if (!phaseRepository.existsById(phaseId)) {
            return false;
        }
        // Check for tasks? Cascade delete handles it but maybe we want to prevent if tasks exist?
        // For now, let's assume cascade delete is fine or handled by database constraints if strict.
        // But Phase entity has CascadeType.ALL for tasks, so tasks will be deleted.
        
        phaseRepository.deleteById(phaseId);
        return true;
    }
}
