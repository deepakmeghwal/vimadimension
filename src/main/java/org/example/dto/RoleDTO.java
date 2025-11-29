package org.example.dto;

import java.util.Set;

public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private Set<String> permissions;
    private Integer userCount;

    // Constructors
    public RoleDTO() {
    }

    public RoleDTO(Long id, String name, String description, Set<String> permissions, Integer userCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.permissions = permissions;
        this.userCount = userCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }

    public Integer getUserCount() {
        return userCount;
    }

    public void setUserCount(Integer userCount) {
        this.userCount = userCount;
    }
}
