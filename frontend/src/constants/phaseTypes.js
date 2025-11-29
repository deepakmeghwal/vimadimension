// Standard Architectural Phases based on COA (Council of Architecture) India standards
// These phases align with standard architectural practice in India

export const STANDARD_PHASE_TYPES = [
    { value: 'FEASIBILITY_STUDY', label: 'Feasibility Study', sequence: 1 },
    { value: 'SITE_ANALYSIS', label: 'Site Analysis', sequence: 2 },
    { value: 'CONCEPT_DESIGN', label: 'Concept Design', sequence: 3 },
    { value: 'PRELIMINARY_DESIGN', label: 'Preliminary Design / Schematic Design', sequence: 4 },
    { value: 'DESIGN_DEVELOPMENT', label: 'Design Development', sequence: 5 },
    { value: 'WORKING_DRAWINGS', label: 'Working Drawings (GFC)', sequence: 6 },
    { value: 'STATUTORY_APPROVALS', label: 'Statutory Approvals', sequence: 7 },
    { value: 'TENDER_DOCUMENTATION', label: 'Tender Documentation', sequence: 8 },
    { value: 'CONSTRUCTION_DOCUMENTATION', label: 'Construction Documentation', sequence: 9 },
    { value: 'SITE_SUPERVISION', label: 'Site Supervision', sequence: 10 },
    { value: 'COMPLETION_HANDOVER', label: 'Completion & Handover', sequence: 11 },
    { value: 'AS_BUILT_DRAWINGS', label: 'As-Built Drawings', sequence: 12 }
];

export const getPhaseTypeLabel = (value) => {
    const phase = STANDARD_PHASE_TYPES.find(p => p.value === value);
    return phase ? phase.label : value;
};





