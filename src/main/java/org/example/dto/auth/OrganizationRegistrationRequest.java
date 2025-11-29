package org.example.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for organization registration
 */
public class OrganizationRegistrationRequest {

    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Organization name must be between 2 and 100 characters")
    private String organizationName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String organizationDescription;

    @NotBlank(message = "Organization email is required")
    @Email(message = "Please provide a valid organization email")
    private String organizationEmail;

    private String organizationPhone;
    private String organizationAddress;
    private String organizationWebsite;

    @NotBlank(message = "Admin name is required")
    @Size(min = 2, max = 100, message = "Admin name must be between 2 and 100 characters")
    private String adminName;

    @NotBlank(message = "Admin username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String adminUsername;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Please provide a valid admin email")
    private String adminEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String adminPassword;

    private String adminDesignation;
    private String adminSpecialization;

    // Getters and Setters
    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationDescription() {
        return organizationDescription;
    }

    public void setOrganizationDescription(String organizationDescription) {
        this.organizationDescription = organizationDescription;
    }

    public String getOrganizationEmail() {
        return organizationEmail;
    }

    public void setOrganizationEmail(String organizationEmail) {
        this.organizationEmail = organizationEmail;
    }

    public String getOrganizationPhone() {
        return organizationPhone;
    }

    public void setOrganizationPhone(String organizationPhone) {
        this.organizationPhone = organizationPhone;
    }

    public String getOrganizationAddress() {
        return organizationAddress;
    }

    public void setOrganizationAddress(String organizationAddress) {
        this.organizationAddress = organizationAddress;
    }

    public String getOrganizationWebsite() {
        return organizationWebsite;
    }

    public void setOrganizationWebsite(String organizationWebsite) {
        this.organizationWebsite = organizationWebsite;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public String getAdminDesignation() {
        return adminDesignation;
    }

    public void setAdminDesignation(String adminDesignation) {
        this.adminDesignation = adminDesignation;
    }

    public String getAdminSpecialization() {
        return adminSpecialization;
    }

    public void setAdminSpecialization(String adminSpecialization) {
        this.adminSpecialization = adminSpecialization;
    }
}







