package org.example.models.enums;

/**
 * Standard Architectural Phases based on Council of Architecture (COA) India standards.
 * These phases align with the standard architectural practice in India.
 */
public enum PhaseType {
    FEASIBILITY_STUDY("Feasibility Study", 1),
    SITE_ANALYSIS("Site Analysis", 2),
    CONCEPT_DESIGN("Concept Design", 3),
    PRELIMINARY_DESIGN("Preliminary Design / Schematic Design", 4),
    DESIGN_DEVELOPMENT("Design Development", 5),
    WORKING_DRAWINGS("Working Drawings (GFC)", 6),
    STATUTORY_APPROVALS("Statutory Approvals", 7),
    TENDER_DOCUMENTATION("Tender Documentation", 8),
    CONSTRUCTION_DOCUMENTATION("Construction Documentation", 9),
    SITE_SUPERVISION("Site Supervision", 10),
    COMPLETION_HANDOVER("Completion & Handover", 11),
    AS_BUILT_DRAWINGS("As-Built Drawings", 12);

    private final String displayName;
    private final int sequence;

    PhaseType(String displayName, int sequence) {
        this.displayName = displayName;
        this.sequence = sequence;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getSequence() {
        return sequence;
    }

    @Override
    public String toString() {
        return displayName;
    }
}





