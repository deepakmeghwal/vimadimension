package org.example.models.enums;

/**
 * Project Lifecycle Stages based on Council of Architecture (COA) India standards.
 * These stages align with the standard "Scale of Charges" for architectural services in India.
 */
public enum ProjectStage {
    CONCEPT("Concept Design"),
    PRELIM("Preliminary Design"),
    STATUTORY("Statutory Approvals (Liaison)"),
    TENDER("Working Drawings & Tender"),
    CONTRACT("Appointment of Contractor"),
    CONSTRUCTION("Construction Supervision"),
    COMPLETION("Completion & Handover");

    private final String displayName;

    ProjectStage(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}

