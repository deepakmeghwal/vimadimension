package org.example.models.enums;

public enum ProjectChargeType {
    REGULAR("Regular"),
    OVERHEAD("Overhead"),
    PROMOTIONAL("Promotional");

    private final String displayName;

    ProjectChargeType(String displayName) {
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
