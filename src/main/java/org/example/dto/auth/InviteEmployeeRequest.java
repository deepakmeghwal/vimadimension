package org.example.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for employee invitation
 */
public class InviteEmployeeRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    private String roleName = "ROLE_EMPLOYEE";

    // Default constructor
    public InviteEmployeeRequest() {}

    public InviteEmployeeRequest(String email, String roleName) {
        this.email = email;
        this.roleName = roleName;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}







