package org.example.models.enums;

public enum ProjectStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    DORMANT("Dormant"),
    IN_DISCUSSION("In Discussion"),
    PROGRESS("In Progress"),
    ON_HOLD("On Hold"),
    COMPLETED("Completed"),
    ARCHIVED("Archived");

    private final String displayName;

    ProjectStatus(String displayName) {
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

