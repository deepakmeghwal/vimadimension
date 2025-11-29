package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "organizations")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Organization {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String contactEmail;
    
    private String contactPhone;
    private String address;
    private String website;
    
    // Indian Invoice Details
    @Column(name = "logo_url", length = 500)
    private String logoUrl;
    
    @Column(name = "gstin", length = 15)
    private String gstin; // 15-digit GSTIN
    
    @Column(name = "pan", length = 10)
    private String pan; // 10-character PAN
    
    @Column(name = "coa_reg_number", length = 50)
    private String coaRegNumber; // Council of Architecture Registration Number
    
    @Column(name = "address_line1", length = 255)
    private String addressLine1;
    
    @Column(name = "address_line2", length = 255)
    private String addressLine2;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "state", length = 100)
    private String state;
    
    @Column(name = "pincode", length = 10)
    private String pincode;
    
    // Bank Details
    @Column(name = "bank_name", length = 255)
    private String bankName;
    
    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;
    
    @Column(name = "bank_ifsc", length = 11)
    private String bankIfsc; // 11-character IFSC code
    
    @Column(name = "bank_branch", length = 255)
    private String bankBranch;
    
    @Column(name = "bank_account_name", length = 255)
    private String bankAccountName;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private boolean verified = false;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @JsonIgnore // Prevent circular reference during JSON serialization
    private Set<User> users;
    
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @JsonIgnore // Prevent circular reference during JSON serialization
    private Set<Project> projects;
    
    // Constructors
    public Organization() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Organization(String name, String description, String contactEmail) {
        this();
        this.name = name;
        this.description = description;
        this.contactEmail = contactEmail;
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
    
    public String getContactEmail() {
        return contactEmail;
    }
    
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
    
    public String getContactPhone() {
        return contactPhone;
    }
    
    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Set<User> getUsers() {
        return users;
    }
    
    public void setUsers(Set<User> users) {
        this.users = users;
    }
    
    public Set<Project> getProjects() {
        return projects;
    }
    
    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }
    
    public boolean isVerified() {
        return verified;
    }
    
    public void setVerified(boolean verified) {
        this.verified = verified;
    }
    
    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }
    
    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
    
    /**
     * Marks the organization as verified
     */
    public void verify() {
        this.verified = true;
        this.verifiedAt = LocalDateTime.now();
    }
    
    // Getters and Setters for new fields
    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getPan() {
        return pan;
    }

    public void setPan(String pan) {
        this.pan = pan;
    }

    public String getCoaRegNumber() {
        return coaRegNumber;
    }

    public void setCoaRegNumber(String coaRegNumber) {
        this.coaRegNumber = coaRegNumber;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBankIfsc() {
        return bankIfsc;
    }

    public void setBankIfsc(String bankIfsc) {
        this.bankIfsc = bankIfsc;
    }

    public String getBankBranch() {
        return bankBranch;
    }

    public void setBankBranch(String bankBranch) {
        this.bankBranch = bankBranch;
    }

    public String getBankAccountName() {
        return bankAccountName;
    }

    public void setBankAccountName(String bankAccountName) {
        this.bankAccountName = bankAccountName;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}