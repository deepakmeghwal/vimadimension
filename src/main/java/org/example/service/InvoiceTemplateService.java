package org.example.service;

import org.example.models.InvoiceTemplate;
import org.example.models.Organization;
import org.example.repository.InvoiceTemplateRepository;
import org.example.repository.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InvoiceTemplateService {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceTemplateService.class);

    private final InvoiceTemplateRepository templateRepository;
    private final OrganizationRepository organizationRepository;

    @Autowired
    public InvoiceTemplateService(InvoiceTemplateRepository templateRepository, 
                                  OrganizationRepository organizationRepository) {
        this.templateRepository = templateRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<InvoiceTemplate> getAllActiveTemplates() {
        return templateRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<InvoiceTemplate> getTemplatesForOrganization(Long organizationId) {
        // Get both global templates and organization-specific templates
        List<InvoiceTemplate> globalTemplates = templateRepository.findByOrganizationIsNullAndIsActiveTrue();
        List<InvoiceTemplate> orgTemplates = templateRepository.findByOrganization_IdAndIsActiveTrue(organizationId);
        
        // Combine and return
        globalTemplates.addAll(orgTemplates);
        return globalTemplates;
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceTemplate> getDefaultTemplate(Long organizationId) {
        // First try to get organization-specific default
        if (organizationId != null) {
            Optional<InvoiceTemplate> orgDefault = templateRepository.findByIsDefaultTrueAndOrganization_Id(organizationId);
            if (orgDefault.isPresent()) {
                return orgDefault;
            }
        }
        // Fall back to global default
        return templateRepository.findByIsDefaultTrueAndOrganizationIsNull();
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceTemplate> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<InvoiceTemplate> getTemplateByCode(String templateCode) {
        return templateRepository.findByTemplateCode(templateCode);
    }

    @Transactional
    public InvoiceTemplate createTemplate(InvoiceTemplate template) {
        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(template.getIsDefault())) {
            if (template.getOrganization() != null) {
                templateRepository.findByIsDefaultTrueAndOrganization_Id(template.getOrganization().getId())
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        templateRepository.save(existing);
                    });
            } else {
                templateRepository.findByIsDefaultTrueAndOrganizationIsNull()
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        templateRepository.save(existing);
                    });
            }
        }
        return templateRepository.save(template);
    }

    @Transactional
    public InvoiceTemplate updateTemplate(Long id, InvoiceTemplate templateData) {
        InvoiceTemplate template = templateRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Template not found with ID: " + id));

        template.setName(templateData.getName());
        template.setDescription(templateData.getDescription());
        template.setHeaderHtml(templateData.getHeaderHtml());
        template.setFooterHtml(templateData.getFooterHtml());
        template.setCssStyles(templateData.getCssStyles());
        template.setIsActive(templateData.getIsActive());

        // Handle default flag
        if (Boolean.TRUE.equals(templateData.getIsDefault()) && !Boolean.TRUE.equals(template.getIsDefault())) {
            if (template.getOrganization() != null) {
                templateRepository.findByIsDefaultTrueAndOrganization_Id(template.getOrganization().getId())
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        templateRepository.save(existing);
                    });
            } else {
                templateRepository.findByIsDefaultTrueAndOrganizationIsNull()
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        templateRepository.save(existing);
                    });
            }
            template.setIsDefault(true);
        }

        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    @Transactional
    public void initializeDefaultTemplates() {
        // Check if default Indian template already exists
        Optional<InvoiceTemplate> existing = templateRepository.findByTemplateCode("INDIA_STANDARD");
        if (existing.isPresent()) {
            logger.info("Default Indian invoice template already exists");
            return;
        }

        // Create default Indian invoice template
        InvoiceTemplate indiaTemplate = new InvoiceTemplate();
        indiaTemplate.setName("India Standard Invoice");
        indiaTemplate.setTemplateCode("INDIA_STANDARD");
        indiaTemplate.setDescription("Standard invoice template for India with GST compliance");
        indiaTemplate.setIsDefault(true);
        indiaTemplate.setIsActive(true);
        indiaTemplate.setOrganization(null); // Global template

        // Indian invoice header HTML (with GST fields)
        String headerHtml = """
            <div class="invoice-header">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            {{#if organizationLogo}}
                            <img src="{{organizationLogo}}" alt="Logo" style="max-height: 80px; margin-bottom: 10px;" />
                            {{/if}}
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            <h2 style="margin: 0; font-size: 24px; font-weight: bold;">INVOICE</h2>
                        </td>
                    </tr>
                </table>
                <hr style="border: 2px solid #000; margin: 10px 0;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <strong>{{organizationName}}</strong><br>
                            {{organizationAddressLine1}}<br>
                            {{organizationAddressLine2}}<br>
                            {{organizationCity}}, {{organizationState}} - {{organizationPincode}}<br>
                            Phone: {{organizationPhone}}<br>
                            Email: {{organizationEmail}}<br>
                            {{#if organizationGstin}}GSTIN: {{organizationGstin}}<br>{{/if}}
                            {{#if organizationPan}}PAN: {{organizationPan}}<br>{{/if}}
                            {{#if organizationCoaRegNumber}}COA Reg. No.: {{organizationCoaRegNumber}}{{/if}}
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            <strong>Invoice No:</strong> {{invoiceNumber}}<br>
                            <strong>Invoice Date:</strong> {{issueDate}}<br>
                            <strong>Due Date:</strong> {{dueDate}}
                        </td>
                    </tr>
                </table>
                <hr style="border: 1px solid #000; margin: 10px 0;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <strong>BILL TO:</strong><br>
                            {{clientName}}<br>
                            {{clientAddress}}<br>
                            {{#if clientGstin}}GSTIN: {{clientGstin}}{{else}}GSTIN: Unregistered{{/if}}
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <strong>PROJECT:</strong><br>
                            {{projectName}}<br>
                            {{projectLocation}}<br>
                            Ref: Agreement dated {{agreementDate}}
                        </td>
                    </tr>
                </table>
                <hr style="border: 1px solid #000; margin: 10px 0;">
            </div>
            """;

        // Indian invoice footer HTML (with payment terms and bank details)
        String footerHtml = """
            <div class="invoice-footer">
                <hr style="border: 1px solid #000; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="vertical-align: top;">
                            <strong>Notes:</strong><br>
                            {{notes}}<br><br>
                            <strong>Payment Terms:</strong><br>
                            {{termsAndConditions}}<br><br>
                            <strong>Bank Details:</strong><br>
                            Bank: {{bankName}}<br>
                            A/c No: {{bankAccountNumber}}<br>
                            IFSC: {{bankIfsc}}<br>
                            Branch: {{bankBranch}}<br>
                            Account Name: {{bankAccountName}}<br><br>
                            Please make payments via NEFT/RTGS/Cheque in favour of "{{bankAccountName}}".<br>
                            Please deduct TDS u/s 194J (10% for individuals/firms, as applicable) and provide the TDS certificate.<br>
                            Payment is due within {{paymentDays}} days of the invoice date.
                        </td>
                    </tr>
                </table>
                <hr style="border: 1px solid #000; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: center;">
                            <p>For {{organizationName}}</p>
                            <br><br>
                            <p>_________________________</p>
                            <p>(Authorized Signatory)</p>
                        </td>
                    </tr>
                </table>
            </div>
            """;

        // CSS styles for Indian invoice
        String cssStyles = """
            .invoice-header {
                margin-bottom: 30px;
            }
            .invoice-header h2 {
                color: #2c3e50;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .invoice-header h3 {
                color: #34495e;
                font-size: 20px;
                margin-bottom: 10px;
            }
            .invoice-header h4 {
                color: #7f8c8d;
                font-size: 16px;
                margin-bottom: 10px;
            }
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .invoice-table th {
                background-color: #34495e;
                color: white;
                padding: 12px;
                text-align: left;
                border: 1px solid #ddd;
            }
            .invoice-table td {
                padding: 10px;
                border: 1px solid #ddd;
            }
            .invoice-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .invoice-totals {
                margin-top: 20px;
                text-align: right;
            }
            .invoice-totals table {
                width: 100%;
                max-width: 400px;
                margin-left: auto;
            }
            .invoice-totals td {
                padding: 8px;
                border-bottom: 1px solid #ddd;
            }
            .invoice-totals .total-row {
                font-weight: bold;
                font-size: 18px;
                background-color: #ecf0f1;
            }
            .invoice-footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #34495e;
            }
            .gst-section {
                background-color: #fff3cd;
                padding: 15px;
                border: 1px solid #ffc107;
                margin: 20px 0;
            }
            """;

        indiaTemplate.setHeaderHtml(headerHtml);
        indiaTemplate.setFooterHtml(footerHtml);
        indiaTemplate.setCssStyles(cssStyles);

        templateRepository.save(indiaTemplate);
        logger.info("Default Indian invoice template created successfully");
    }
}

