package org.example.models.enums;

public enum ActivityType {
    CALL("Call"),
    MEETING("Meeting"),
    EMAIL("Email"),
    NOTE("Note");

    private final String displayName;

    ActivityType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
