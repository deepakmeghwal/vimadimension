package org.example.models.enums;

public enum DrawingType {
    SITE_PLAN("Site Plan"),
    FLOOR_PLAN("Floor Plan"),
    ELEVATION("Elevation"),
    SECTION("Section"),
    STRUCTURAL("Structural Drawing"),
    ELECTRICAL("Electrical Drawing"),
    PLUMBING("Plumbing Drawing"),
    HVAC("HVAC Drawing"),
    FIRE_FIGHTING("Fire Fighting Drawing"),
    LANDSCAPE("Landscape Drawing"),
    INTERIOR("Interior Design"),
    WORKING("Working Drawing"),
    SUBMISSION("Submission Drawing"),
    PRESENTATION("Presentation Drawing"),
    OTHER("Other");

    private final String displayName;

    DrawingType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
