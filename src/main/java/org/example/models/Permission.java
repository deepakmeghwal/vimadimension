package org.example.models;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String name; // e.g., "users.create", "projects.view"
    
    @Column(length = 50)
    private String resource; // e.g., "users", "projects", "tasks"
    
    @Column(length = 50)
    private String action; // e.g., "create", "read", "update", "delete"
    
    @Column(length = 255)
    private String description;
    
    @ManyToMany(mappedBy = "permissions")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Role> roles = new HashSet<>();
    
    public Permission() {
    }

    public Permission(Long id, String name, String resource, String action, String description, Set<Role> roles) {
        this.id = id;
        this.name = name;
        this.resource = resource;
        this.action = action;
        this.description = description;
        this.roles = roles;
    }
    
    public Permission(String name, String resource, String action, String description) {
        this.name = name;
        this.resource = resource;
        this.action = action;
        this.description = description;
    }

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

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Permission)) return false;
        Permission that = (Permission) o;
        return name != null && name.equals(that.name);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
