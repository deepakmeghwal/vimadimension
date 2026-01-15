package org.example.service;

import org.example.models.Phase;
import org.example.models.PhaseSubstage;
import org.example.models.User;
import org.example.models.enums.ProjectStage;
import org.example.repository.PhaseSubstageRepository;
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

import java.util.*;

/**
 * Service for managing phase substages with predefined deliverables 
 * based on COA India architectural standards.
 */
@Service
public class PhaseSubstageService {

    private static final Logger logger = LoggerFactory.getLogger(PhaseSubstageService.class);

    private final PhaseSubstageRepository substageRepository;
    private final PhaseRepository phaseRepository;
    private final UserRepository userRepository;

    // Predefined substages for each project stage type
    private static final Map<String, List<String>> PREDEFINED_SUBSTAGES = new LinkedHashMap<>();

    static {
        // CONCEPT - Concept Design
        PREDEFINED_SUBSTAGES.put("CONCEPT", Arrays.asList(
            "Site analysis & survey study",
            "Client brief finalization",
            "Concept sketches/diagrams",
            "Preliminary area statement",
            "Client presentation & approval"
        ));

        // PRELIM - Preliminary Design
        PREDEFINED_SUBSTAGES.put("PRELIM", Arrays.asList(
            "Preliminary drawings (plans, elevations, sections)",
            "3D views/renders",
            "Preliminary structural layout",
            "Preliminary MEP layouts",
            "Preliminary cost estimate",
            "Client presentation & approval"
        ));

        // STATUTORY - Statutory Approvals (Liaison)
        PREDEFINED_SUBSTAGES.put("STATUTORY", Arrays.asList(
            "Building plan submission drawings",
            "NOC applications (Fire, AAI, Environment, etc.)",
            "Liaison with local authorities",
            "Sanction drawing receipt",
            "Building permit obtained"
        ));

        // TENDER - Working Drawings & Tender
        PREDEFINED_SUBSTAGES.put("TENDER", Arrays.asList(
            "Detailed architectural drawings",
            "Structural drawings",
            "Electrical drawings",
            "Plumbing & sanitary drawings",
            "HVAC drawings (if applicable)",
            "Detailed specifications",
            "Bill of Quantities (BOQ)",
            "Tender document preparation"
        ));

        // CONTRACT - Appointment of Contractor
        PREDEFINED_SUBSTAGES.put("CONTRACT", Arrays.asList(
            "Pre-qualification of contractors",
            "Tender issuance",
            "Bid evaluation & comparison",
            "Contractor selection",
            "Contract agreement signing"
        ));

        // CONSTRUCTION - Construction Supervision
        PREDEFINED_SUBSTAGES.put("CONSTRUCTION", Arrays.asList(
            "Site visits & coordination",
            "RFI responses",
            "Shop drawing approvals",
            "Material approval",
            "Running bills certification",
            "Progress monitoring",
            "Variation order management"
        ));

        // COMPLETION - Completion & Handover
        PREDEFINED_SUBSTAGES.put("COMPLETION", Arrays.asList(
            "Defect liability inspection",
            "Snag list preparation",
            "As-built drawings collection",
            "Occupancy certificate assistance",
            "Final handover to client"
        ));
    }

    @Autowired
    public PhaseSubstageService(PhaseSubstageRepository substageRepository,
                                 PhaseRepository phaseRepository,
                                 UserRepository userRepository) {
        this.substageRepository = substageRepository;
        this.phaseRepository = phaseRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * Create predefined substages for a phase based on its name/type.
     */
    @Transactional
    public List<PhaseSubstage> createDefaultSubstages(Phase phase) {
        // Try to determine the stage type from phase name
        String stageKey = determineStageKey(phase.getName());
        
        if (stageKey == null || !PREDEFINED_SUBSTAGES.containsKey(stageKey)) {
            logger.warn("No predefined substages for phase: {}", phase.getName());
            return new ArrayList<>();
        }

        List<String> substageNames = PREDEFINED_SUBSTAGES.get(stageKey);
        List<PhaseSubstage> createdSubstages = new ArrayList<>();

        for (int i = 0; i < substageNames.size(); i++) {
            PhaseSubstage substage = new PhaseSubstage(phase, substageNames.get(i), i + 1);
            createdSubstages.add(substageRepository.save(substage));
        }

        logger.info("Created {} substages for phase {} ({})", createdSubstages.size(), phase.getId(), phase.getName());
        return createdSubstages;
    }

    /**
     * Determine the stage key from phase name.
     */
    private String determineStageKey(String phaseName) {
        if (phaseName == null) return null;
        
        String lowerName = phaseName.toLowerCase().trim();
        logger.debug("Determining stage key for phase name: '{}'", lowerName);
        
        // Direct key match check
        if (PREDEFINED_SUBSTAGES.containsKey(phaseName.toUpperCase())) {
            return phaseName.toUpperCase();
        }
        
        if (lowerName.contains("concept")) return "CONCEPT";
        if (lowerName.contains("preliminary") || lowerName.contains("prelim") || lowerName.contains("schematic")) return "PRELIM";
        if (lowerName.contains("statutory") || lowerName.contains("approval") || lowerName.contains("liaison")) return "STATUTORY";
        if (lowerName.contains("tender") || lowerName.contains("working")) return "TENDER";
        if (lowerName.contains("contract") || lowerName.contains("appointment")) return "CONTRACT";
        if (lowerName.contains("construction") || lowerName.contains("supervision")) return "CONSTRUCTION";
        if (lowerName.contains("completion") || lowerName.contains("handover") || lowerName.contains("closeout")) return "COMPLETION";
        
        logger.warn("Could not match phase name '{}' to any predefined stage key", phaseName);
        return null;
    }

    /**
     * Get all substages for a phase.
     */
    public List<PhaseSubstage> getSubstagesByPhaseId(Long phaseId) {
        return substageRepository.findByPhase_IdOrderByDisplayOrderAsc(phaseId);
    }

    /**
     * Mark a substage as complete.
     */
    @Transactional
    public PhaseSubstage markComplete(Long substageId) {
        PhaseSubstage substage = substageRepository.findById(substageId)
                .orElseThrow(() -> new IllegalArgumentException("Substage not found: " + substageId));
        
        User currentUser = getCurrentAuthenticatedUser();
        substage.markComplete(currentUser);
        
        return substageRepository.save(substage);
    }

    /**
     * Mark a substage as incomplete.
     */
    @Transactional
    public PhaseSubstage markIncomplete(Long substageId) {
        PhaseSubstage substage = substageRepository.findById(substageId)
                .orElseThrow(() -> new IllegalArgumentException("Substage not found: " + substageId));
        
        substage.markIncomplete();
        
        return substageRepository.save(substage);
    }

    /**
     * Check if all substages are complete for a phase.
     */
    public boolean areAllSubstagesComplete(Long phaseId) {
        long total = substageRepository.countByPhaseId(phaseId);
        if (total == 0) {
            // No substages means phase is ready for invoicing
            return true;
        }
        return substageRepository.areAllCompleteByPhaseId(phaseId);
    }

    /**
     * Get completion status for a phase.
     */
    public Map<String, Object> getCompletionStatus(Long phaseId) {
        long total = substageRepository.countByPhaseId(phaseId);
        long incomplete = substageRepository.countIncompleteByPhaseId(phaseId);
        long complete = total - incomplete;
        
        Map<String, Object> status = new HashMap<>();
        status.put("total", total);
        status.put("complete", complete);
        status.put("incomplete", incomplete);
        status.put("allComplete", incomplete == 0);
        status.put("percentage", total > 0 ? (complete * 100 / total) : 100);
        
        return status;
    }

    /**
     * Get substage by ID.
     */
    public Optional<PhaseSubstage> getSubstageById(Long id) {
        return substageRepository.findById(id);
    }

    /**
     * Get predefined substages for a stage type (for reference/preview).
     */
    public List<String> getPredefinedSubstagesForStage(String stageKey) {
        return PREDEFINED_SUBSTAGES.getOrDefault(stageKey.toUpperCase(), new ArrayList<>());
    }

    /**
     * Get all predefined substage mappings.
     */
    public Map<String, List<String>> getAllPredefinedSubstages() {
        return Collections.unmodifiableMap(PREDEFINED_SUBSTAGES);
    }
}
