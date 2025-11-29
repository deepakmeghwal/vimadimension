package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.example.models.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_email")
    private String clientEmail;

    @Column(name = "client_address", columnDefinition = "TEXT")
    private String clientAddress;

    @Column(name = "client_phone")
    private String clientPhone;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "subtotal", precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    // GST Fields for Indian invoices
    @Column(name = "cgst_rate", precision = 5, scale = 2)
    private BigDecimal cgstRate = BigDecimal.ZERO; // Central GST rate (typically 9% if same state)

    @Column(name = "cgst_amount", precision = 15, scale = 2)
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(name = "sgst_rate", precision = 5, scale = 2)
    private BigDecimal sgstRate = BigDecimal.ZERO; // State GST rate (typically 9% if same state)

    @Column(name = "sgst_amount", precision = 15, scale = 2)
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(name = "igst_rate", precision = 5, scale = 2)
    private BigDecimal igstRate = BigDecimal.ZERO; // Integrated GST rate (typically 18% if different state)

    @Column(name = "igst_amount", precision = 15, scale = 2)
    private BigDecimal igstAmount = BigDecimal.ZERO;

    // Cumulative fee calculation fields
    @Column(name = "cumulative_fee_percentage", precision = 5, scale = 2)
    private BigDecimal cumulativeFeePercentage; // Total fee percentage up to this stage

    @Column(name = "cumulative_fee_amount", precision = 15, scale = 2)
    private BigDecimal cumulativeFeeAmount; // Total fee amount up to this stage

    @Column(name = "previously_billed_amount", precision = 15, scale = 2)
    private BigDecimal previouslyBilledAmount = BigDecimal.ZERO; // Amount billed in previous invoices

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", precision = 15, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    @JsonIgnore
    private InvoiceTemplate template;

    @Column(name = "last_payment_date")
    private LocalDate lastPaymentDate;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InvoiceItem> items = new ArrayList<>();

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Invoice() {
    }

    public Invoice(String invoiceNumber, Organization organization, String clientName, 
                   LocalDate issueDate, LocalDate dueDate) {
        this.invoiceNumber = invoiceNumber;
        this.organization = organization;
        this.clientName = clientName;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
    }

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateAmounts();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateAmounts();
    }

    // Business methods
    public void calculateAmounts() {
        // Calculate subtotal from items
        subtotal = items.stream()
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate GST amounts
        BigDecimal taxableValue = subtotal;
        
        // If IGST is set (different states), use IGST
        if (igstRate != null && igstRate.compareTo(BigDecimal.ZERO) > 0) {
            igstAmount = taxableValue.multiply(igstRate.divide(BigDecimal.valueOf(100), 4, BigDecimal.ROUND_HALF_UP));
            cgstAmount = BigDecimal.ZERO;
            sgstAmount = BigDecimal.ZERO;
            taxAmount = igstAmount;
        } 
        // If CGST/SGST are set (same state), use them
        else if (cgstRate != null && cgstRate.compareTo(BigDecimal.ZERO) > 0) {
            cgstAmount = taxableValue.multiply(cgstRate.divide(BigDecimal.valueOf(100), 4, BigDecimal.ROUND_HALF_UP));
            sgstAmount = taxableValue.multiply(sgstRate != null ? sgstRate.divide(BigDecimal.valueOf(100), 4, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO);
            igstAmount = BigDecimal.ZERO;
            taxAmount = cgstAmount.add(sgstAmount);
        }
        // Fall back to simple tax rate if GST not set
        else if (taxRate != null && taxRate.compareTo(BigDecimal.ZERO) > 0) {
            taxAmount = taxableValue.multiply(taxRate.divide(BigDecimal.valueOf(100), 4, BigDecimal.ROUND_HALF_UP));
        } else {
            taxAmount = BigDecimal.ZERO;
        }

        // Calculate total amount
        totalAmount = subtotal.add(taxAmount);

        // Calculate balance amount
        balanceAmount = totalAmount.subtract(paidAmount != null ? paidAmount : BigDecimal.ZERO);
    }

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
        calculateAmounts();
    }

    public void removeItem(InvoiceItem item) {
        items.remove(item);
        item.setInvoice(null);
        calculateAmounts();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
        calculateAmounts();
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
        calculateAmounts();
    }

    public BigDecimal getBalanceAmount() {
        return balanceAmount;
    }

    public void setBalanceAmount(BigDecimal balanceAmount) {
        this.balanceAmount = balanceAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDate getLastPaymentDate() {
        return lastPaymentDate;
    }

    public void setLastPaymentDate(LocalDate lastPaymentDate) {
        this.lastPaymentDate = lastPaymentDate;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items;
        if (items != null) {
            items.forEach(item -> item.setInvoice(this));
        }
        calculateAmounts();
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

    // Helper methods for JSON serialization
    public Long getOrganizationId() {
        return organization != null ? organization.getId() : null;
    }

    public String getOrganizationName() {
        return organization != null ? organization.getName() : null;
    }

    public Long getProjectId() {
        return project != null ? project.getId() : null;
    }

    public String getProjectName() {
        return project != null ? project.getName() : null;
    }

    public InvoiceTemplate getTemplate() {
        return template;
    }

    public void setTemplate(InvoiceTemplate template) {
        this.template = template;
    }

    public Long getTemplateId() {
        return template != null ? template.getId() : null;
    }

    // GST Getters and Setters
    public BigDecimal getCgstRate() {
        return cgstRate;
    }

    public void setCgstRate(BigDecimal cgstRate) {
        this.cgstRate = cgstRate;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public void setCgstAmount(BigDecimal cgstAmount) {
        this.cgstAmount = cgstAmount;
    }

    public BigDecimal getSgstRate() {
        return sgstRate;
    }

    public void setSgstRate(BigDecimal sgstRate) {
        this.sgstRate = sgstRate;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public void setSgstAmount(BigDecimal sgstAmount) {
        this.sgstAmount = sgstAmount;
    }

    public BigDecimal getIgstRate() {
        return igstRate;
    }

    public void setIgstRate(BigDecimal igstRate) {
        this.igstRate = igstRate;
    }

    public BigDecimal getIgstAmount() {
        return igstAmount;
    }

    public void setIgstAmount(BigDecimal igstAmount) {
        this.igstAmount = igstAmount;
    }

    // Cumulative fee Getters and Setters
    public BigDecimal getCumulativeFeePercentage() {
        return cumulativeFeePercentage;
    }

    public void setCumulativeFeePercentage(BigDecimal cumulativeFeePercentage) {
        this.cumulativeFeePercentage = cumulativeFeePercentage;
    }

    public BigDecimal getCumulativeFeeAmount() {
        return cumulativeFeeAmount;
    }

    public void setCumulativeFeeAmount(BigDecimal cumulativeFeeAmount) {
        this.cumulativeFeeAmount = cumulativeFeeAmount;
    }

    public BigDecimal getPreviouslyBilledAmount() {
        return previouslyBilledAmount;
    }

    public void setPreviouslyBilledAmount(BigDecimal previouslyBilledAmount) {
        this.previouslyBilledAmount = previouslyBilledAmount;
    }
}