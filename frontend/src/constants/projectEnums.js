// Project Enums - Matching backend enum values
// Project Lifecycle Stages based on Council of Architecture (COA) India standards

export const PROJECT_STAGES = [
    { value: 'CONCEPT', label: 'Concept Design', feePercentage: 10 },
    { value: 'PRELIM', label: 'Preliminary Design', feePercentage: 15 },
    { value: 'STATUTORY', label: 'Statutory Approvals (Liaison)', feePercentage: 10 },
    { value: 'TENDER', label: 'Working Drawings & Tender', feePercentage: 25 },
    { value: 'CONTRACT', label: 'Appointment of Contractor', feePercentage: 5 },
    { value: 'CONSTRUCTION', label: 'Construction Supervision', feePercentage: 25 },
    { value: 'COMPLETION', label: 'Completion & Handover', feePercentage: 10 }
];

// Helper function to get stage fee percentage
export const getStageFeePercentage = (stageValue) => {
    const stage = PROJECT_STAGES.find(s => s.value === stageValue);
    return stage ? stage.feePercentage : 0;
};

export const PROJECT_CHARGE_TYPES = [
    { value: 'REGULAR', label: 'Regular' },
    { value: 'OVERHEAD', label: 'Overhead' },
    { value: 'PROMOTIONAL', label: 'Promotional' }
];

export const PROJECT_STATUSES = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DORMANT', label: 'Dormant' }
];

export const PROJECT_PRIORITIES = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
];

export const TASK_PRIORITIES = [
    { value: 'LOW', label: 'Low', cssClass: 'priority-low' },
    { value: 'MEDIUM', label: 'Medium', cssClass: 'priority-medium' },
    { value: 'HIGH', label: 'High', cssClass: 'priority-high' },
    { value: 'URGENT', label: 'Urgent', cssClass: 'priority-urgent' }
];
export const DRAWING_TYPES = [
    { value: 'SITE_PLAN', label: 'Site Plan' },
    { value: 'FLOOR_PLAN', label: 'Floor Plan' },
    { value: 'ELEVATION', label: 'Elevation' },
    { value: 'SECTION', label: 'Section' },
    { value: 'STRUCTURAL', label: 'Structural Drawing' },
    { value: 'ELECTRICAL', label: 'Electrical Drawing' },
    { value: 'PLUMBING', label: 'Plumbing Drawing' },
    { value: 'HVAC', label: 'HVAC Drawing' },
    { value: 'FIRE_FIGHTING', label: 'Fire Fighting Drawing' },
    { value: 'LANDSCAPE', label: 'Landscape Drawing' },
    { value: 'INTERIOR', label: 'Interior Design' },
    { value: 'WORKING', label: 'Working Drawing' },
    { value: 'SUBMISSION', label: 'Submission Drawing' },
    { value: 'PRESENTATION', label: 'Presentation Drawing' },
    { value: 'OTHER', label: 'Other' }
];
