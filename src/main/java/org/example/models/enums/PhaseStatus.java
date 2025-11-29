package org.example.models.enums;

public enum PhaseStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private final String displayName;

    PhaseStatus(String displayName) {
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
