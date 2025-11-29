package org.example.dto;

import org.example.models.Invoice;
import org.example.models.Organization;
import org.example.models.Project;
import org.example.models.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class InvoiceResponseDto {
    private Long id;
    private String invoiceNumber;
    private Long organizationId;
    private OrganizationDetailsDto organization;
    private Long projectId;
    private String projectName;
    private String clientName;
    private String clientEmail;
    private String clientAddress;
    private String clientPhone;
    private String clientState;
    private String clientGstin;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal cgstRate;
    private BigDecimal cgstAmount;
    private BigDecimal sgstRate;
    private BigDecimal sgstAmount;
    private BigDecimal igstRate;
    private BigDecimal igstAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private BigDecimal cumulativeFeePercentage;
    private BigDecimal cumulativeFeeAmount;
    private BigDecimal previouslyBilledAmount;
    private String notes;
    private String termsAndConditions;
    private List<InvoiceItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested DTO for Organization details
    public static class OrganizationDetailsDto {
        private Long id;
        private String name;
        private String contactEmail;
        private String contactPhone;
        private String address;
        private String website;
        private String logoUrl;
        private String gstin;
        private String pan;
        private String coaRegNumber;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;
        private String bankName;
        private String bankAccountNumber;
        private String bankIfsc;
        private String bankBranch;
        private String bankAccountName;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getContactEmail() { return contactEmail; }
        public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
        public String getContactPhone() { return contactPhone; }
        public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getWebsite() { return website; }
        public void setWebsite(String website) { this.website = website; }
        public String getLogoUrl() { return logoUrl; }
        public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
        public String getGstin() { return gstin; }
        public void setGstin(String gstin) { this.gstin = gstin; }
        public String getPan() { return pan; }
        public void setPan(String pan) { this.pan = pan; }
        public String getCoaRegNumber() { return coaRegNumber; }
        public void setCoaRegNumber(String coaRegNumber) { this.coaRegNumber = coaRegNumber; }
        public String getAddressLine1() { return addressLine1; }
        public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
        public String getAddressLine2() { return addressLine2; }
        public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }
        public String getBankName() { return bankName; }
        public void setBankName(String bankName) { this.bankName = bankName; }
        public String getBankAccountNumber() { return bankAccountNumber; }
        public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }
        public String getBankIfsc() { return bankIfsc; }
        public void setBankIfsc(String bankIfsc) { this.bankIfsc = bankIfsc; }
        public String getBankBranch() { return bankBranch; }
        public void setBankBranch(String bankBranch) { this.bankBranch = bankBranch; }
        public String getBankAccountName() { return bankAccountName; }
        public void setBankAccountName(String bankAccountName) { this.bankAccountName = bankAccountName; }
    }

    // Nested DTO for Invoice Items
    public static class InvoiceItemDto {
        private Long id;
        private String description;
        private String itemType;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal amount;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    // Factory method to create DTO from Invoice entity
    public static InvoiceResponseDto fromEntity(Invoice invoice) {
        InvoiceResponseDto dto = new InvoiceResponseDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setOrganizationId(invoice.getOrganizationId());
        
        // Populate organization details
        Organization org = invoice.getOrganization();
        if (org != null) {
            OrganizationDetailsDto orgDto = new OrganizationDetailsDto();
            orgDto.setId(org.getId());
            orgDto.setName(org.getName());
            orgDto.setContactEmail(org.getContactEmail());
            orgDto.setContactPhone(org.getContactPhone());
            orgDto.setAddress(org.getAddress());
            orgDto.setWebsite(org.getWebsite());
            orgDto.setLogoUrl(org.getLogoUrl());
            orgDto.setGstin(org.getGstin());
            orgDto.setPan(org.getPan());
            orgDto.setCoaRegNumber(org.getCoaRegNumber());
            orgDto.setAddressLine1(org.getAddressLine1());
            orgDto.setAddressLine2(org.getAddressLine2());
            orgDto.setCity(org.getCity());
            orgDto.setState(org.getState());
            orgDto.setPincode(org.getPincode());
            orgDto.setBankName(org.getBankName());
            orgDto.setBankAccountNumber(org.getBankAccountNumber());
            orgDto.setBankIfsc(org.getBankIfsc());
            orgDto.setBankBranch(org.getBankBranch());
            orgDto.setBankAccountName(org.getBankAccountName());
            dto.setOrganization(orgDto);
        }
        
        dto.setProjectId(invoice.getProjectId());
        dto.setProjectName(invoice.getProjectName());
        dto.setClientName(invoice.getClientName());
        dto.setClientEmail(invoice.getClientEmail());
        dto.setClientAddress(invoice.getClientAddress());
        dto.setClientPhone(invoice.getClientPhone());
        
        // Get client state and GSTIN from project's client if available
        if (invoice.getProject() != null && invoice.getProject().getClient() != null) {
            dto.setClientState(invoice.getProject().getClient().getState());
            dto.setClientGstin(invoice.getProject().getClient().getGstin());
        }
        
        dto.setIssueDate(invoice.getIssueDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus());
        dto.setSubtotal(invoice.getSubtotal());
        dto.setTaxRate(invoice.getTaxRate());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setCgstRate(invoice.getCgstRate());
        dto.setCgstAmount(invoice.getCgstAmount());
        dto.setSgstRate(invoice.getSgstRate());
        dto.setSgstAmount(invoice.getSgstAmount());
        dto.setIgstRate(invoice.getIgstRate());
        dto.setIgstAmount(invoice.getIgstAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaidAmount(invoice.getPaidAmount());
        dto.setBalanceAmount(invoice.getBalanceAmount());
        dto.setCumulativeFeePercentage(invoice.getCumulativeFeePercentage());
        dto.setCumulativeFeeAmount(invoice.getCumulativeFeeAmount());
        dto.setPreviouslyBilledAmount(invoice.getPreviouslyBilledAmount());
        dto.setNotes(invoice.getNotes());
        dto.setTermsAndConditions(invoice.getTermsAndConditions());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());
        
        // Convert items
        if (invoice.getItems() != null) {
            dto.setItems(invoice.getItems().stream().map(item -> {
                InvoiceItemDto itemDto = new InvoiceItemDto();
                itemDto.setId(item.getId());
                itemDto.setDescription(item.getDescription());
                itemDto.setItemType(item.getItemType().toString());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setAmount(item.getAmount());
                return itemDto;
            }).collect(Collectors.toList()));
        }
        
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
    public OrganizationDetailsDto getOrganization() { return organization; }
    public void setOrganization(OrganizationDetailsDto organization) { this.organization = organization; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    public String getClientAddress() { return clientAddress; }
    public void setClientAddress(String clientAddress) { this.clientAddress = clientAddress; }
    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    public String getClientState() { return clientState; }
    public void setClientState(String clientState) { this.clientState = clientState; }
    public String getClientGstin() { return clientGstin; }
    public void setClientGstin(String clientGstin) { this.clientGstin = clientGstin; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getCgstRate() { return cgstRate; }
    public void setCgstRate(BigDecimal cgstRate) { this.cgstRate = cgstRate; }
    public BigDecimal getCgstAmount() { return cgstAmount; }
    public void setCgstAmount(BigDecimal cgstAmount) { this.cgstAmount = cgstAmount; }
    public BigDecimal getSgstRate() { return sgstRate; }
    public void setSgstRate(BigDecimal sgstRate) { this.sgstRate = sgstRate; }
    public BigDecimal getSgstAmount() { return sgstAmount; }
    public void setSgstAmount(BigDecimal sgstAmount) { this.sgstAmount = sgstAmount; }
    public BigDecimal getIgstRate() { return igstRate; }
    public void setIgstRate(BigDecimal igstRate) { this.igstRate = igstRate; }
    public BigDecimal getIgstAmount() { return igstAmount; }
    public void setIgstAmount(BigDecimal igstAmount) { this.igstAmount = igstAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; }
    public BigDecimal getCumulativeFeePercentage() { return cumulativeFeePercentage; }
    public void setCumulativeFeePercentage(BigDecimal cumulativeFeePercentage) { this.cumulativeFeePercentage = cumulativeFeePercentage; }
    public BigDecimal getCumulativeFeeAmount() { return cumulativeFeeAmount; }
    public void setCumulativeFeeAmount(BigDecimal cumulativeFeeAmount) { this.cumulativeFeeAmount = cumulativeFeeAmount; }
    public BigDecimal getPreviouslyBilledAmount() { return previouslyBilledAmount; }
    public void setPreviouslyBilledAmount(BigDecimal previouslyBilledAmount) { this.previouslyBilledAmount = previouslyBilledAmount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getTermsAndConditions() { return termsAndConditions; }
    public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }
    public List<InvoiceItemDto> getItems() { return items; }
    public void setItems(List<InvoiceItemDto> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}





