package org.example.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.HorizontalAlignment;
import org.example.models.Invoice;
import org.example.models.InvoiceItem;
import org.example.models.Organization;
import org.example.models.Payslip;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfService {

    private static final Logger logger = LoggerFactory.getLogger(PdfService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
    private static final String DEFAULT_LOGO_PATH = "static/images/firm-logo.jpg";

    public byte[] generateInvoicePdf(Invoice invoice) {
        logger.info("Generating PDF for invoice: {}", invoice.getInvoiceNumber());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfDocument pdfDoc = new PdfDocument(new PdfWriter(baos));
            Document document = new Document(pdfDoc);

            // Add header
            addHeader(document, invoice);

            // Add invoice details
            addInvoiceDetails(document, invoice);

            // Add client information
            addClientInformation(document, invoice);

            // Add line items
            addLineItems(document, invoice);

            // Add totals
            addTotals(document, invoice);

            // Add footer
            addFooter(document, invoice);

            document.close();
            
            logger.info("PDF generated successfully for invoice: {}", invoice.getInvoiceNumber());
            return baos.toByteArray();

        } catch (Exception e) {
            logger.error("Failed to generate PDF for invoice: {}", invoice.getInvoiceNumber(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void addHeader(Document document, Invoice invoice) {
        Organization org = invoice.getOrganization();
        
        // Create a table for header layout (logo on left, invoice title on right)
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));

        // Left cell - Logo and organization info
        Cell leftCell = new Cell().setBorder(null);
        
        // Add logo (from organization logo URL if available)
        if (org.getLogoUrl() != null && !org.getLogoUrl().trim().isEmpty()) {
            try {
                java.net.URL logoUrl = new java.net.URL(org.getLogoUrl());
                ImageData logoImageData = ImageDataFactory.create(logoUrl);
                Image logo = new Image(logoImageData);
                logo.setWidth(100);
                logo.setHeight(60);
                logo.setHorizontalAlignment(HorizontalAlignment.LEFT);
                leftCell.add(logo);
                leftCell.add(new Paragraph("\n").setFontSize(6));
            } catch (Exception e) {
                logger.warn("Could not load logo from URL: {}", e.getMessage());
                addLogoToCell(leftCell); // Fall back to default logo
            }
        } else {
            addLogoToCell(leftCell);
        }

        // Organization name
        Paragraph orgName = new Paragraph(org.getName())
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.LEFT);
        leftCell.add(orgName);

        // Organization address (use structured address if available)
        if (org.getAddressLine1() != null) {
            leftCell.add(new Paragraph(org.getAddressLine1()).setFontSize(9));
        }
        if (org.getAddressLine2() != null) {
            leftCell.add(new Paragraph(org.getAddressLine2()).setFontSize(9));
        }
        String addressLine = "";
        if (org.getCity() != null) addressLine += org.getCity();
        if (org.getState() != null) {
            if (!addressLine.isEmpty()) addressLine += ", ";
            addressLine += org.getState();
        }
        if (org.getPincode() != null) {
            if (!addressLine.isEmpty()) addressLine += " - ";
            addressLine += org.getPincode();
        }
        if (!addressLine.isEmpty()) {
            leftCell.add(new Paragraph(addressLine).setFontSize(9));
        } else if (org.getAddress() != null) {
            leftCell.add(new Paragraph(org.getAddress()).setFontSize(9));
        }
        
        if (org.getContactPhone() != null) {
            leftCell.add(new Paragraph("Phone: " + org.getContactPhone()).setFontSize(9));
        }
        if (org.getContactEmail() != null) {
            leftCell.add(new Paragraph("Email: " + org.getContactEmail()).setFontSize(9));
        }
        if (org.getGstin() != null) {
            leftCell.add(new Paragraph("GSTIN: " + org.getGstin()).setFontSize(9));
        }
        if (org.getPan() != null) {
            leftCell.add(new Paragraph("PAN: " + org.getPan()).setFontSize(9));
        }
        if (org.getCoaRegNumber() != null) {
            leftCell.add(new Paragraph("COA Reg. No.: " + org.getCoaRegNumber()).setFontSize(9));
        }

        // Right cell - Invoice title and details
        Cell rightCell = new Cell().setBorder(null);
        Paragraph invoiceTitle = new Paragraph("INVOICE")
                .setFontSize(32)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT);
        rightCell.add(invoiceTitle);
        
        rightCell.add(new Paragraph("Invoice No: " + invoice.getInvoiceNumber()).setFontSize(10).setTextAlignment(TextAlignment.RIGHT));
        rightCell.add(new Paragraph("Invoice Date: " + invoice.getIssueDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))).setFontSize(10).setTextAlignment(TextAlignment.RIGHT));
        rightCell.add(new Paragraph("Due Date: " + invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))).setFontSize(10).setTextAlignment(TextAlignment.RIGHT));

        // Add cells to table
        headerTable.addCell(leftCell);
        headerTable.addCell(rightCell);
        
        document.add(headerTable);
        document.add(new Paragraph("\n"));
    }

    private void addInvoiceDetails(Document document, Invoice invoice) {
        // Create a table for invoice details
        Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));

        // Left column - Invoice details
        Cell leftCell = new Cell()
                .setBorder(null)
                .add(new Paragraph("Invoice Number: " + invoice.getInvoiceNumber()).setBold())
                .add(new Paragraph("Issue Date: " + invoice.getIssueDate().format(DATE_FORMATTER)))
                .add(new Paragraph("Due Date: " + invoice.getDueDate().format(DATE_FORMATTER)))
                .add(new Paragraph("Status: " + invoice.getStatus().getDisplayName()));

        if (invoice.getProject() != null) {
            leftCell.add(new Paragraph("Project: " + invoice.getProjectName()));
        }

        detailsTable.addCell(leftCell);

        // Right column - Empty for now (could add logo later)
        Cell rightCell = new Cell().setBorder(null);
        detailsTable.addCell(rightCell);

        document.add(detailsTable);
        document.add(new Paragraph("\n"));
    }

    private void addClientInformation(Document document, Invoice invoice) {
        // Create a table for Bill To and Project sections
        Table clientProjectTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));

        // Left cell - Bill To
        Cell billToCell = new Cell().setBorder(null);
        billToCell.add(new Paragraph("BILL TO:").setFontSize(12).setBold());
        
        Paragraph clientName = new Paragraph(invoice.getClientName())
                .setFontSize(12)
                .setBold();
        billToCell.add(clientName);

        if (invoice.getClientAddress() != null && !invoice.getClientAddress().trim().isEmpty()) {
            billToCell.add(new Paragraph(invoice.getClientAddress()).setFontSize(10));
        }

        // Get client GSTIN from project's client if available
        String clientGstin = null;
        if (invoice.getProject() != null && invoice.getProject().getClient() != null) {
            clientGstin = invoice.getProject().getClient().getGstin();
        }
        if (clientGstin != null && !clientGstin.trim().isEmpty()) {
            billToCell.add(new Paragraph("GSTIN: " + clientGstin).setFontSize(10));
        } else {
            billToCell.add(new Paragraph("GSTIN: Unregistered").setFontSize(10));
        }

        if (invoice.getClientEmail() != null && !invoice.getClientEmail().trim().isEmpty()) {
            billToCell.add(new Paragraph("Email: " + invoice.getClientEmail()).setFontSize(10));
        }

        if (invoice.getClientPhone() != null && !invoice.getClientPhone().trim().isEmpty()) {
            billToCell.add(new Paragraph("Phone: " + invoice.getClientPhone()).setFontSize(10));
        }

        // Right cell - Project
        Cell projectCell = new Cell().setBorder(null);
        projectCell.add(new Paragraph("PROJECT:").setFontSize(12).setBold());
        
        if (invoice.getProject() != null) {
            projectCell.add(new Paragraph(invoice.getProject().getName()).setFontSize(12).setBold());
            if (invoice.getProject().getLocation() != null) {
                projectCell.add(new Paragraph(invoice.getProject().getLocation()).setFontSize(10));
            }
            if (invoice.getProject().getStartDate() != null) {
                projectCell.add(new Paragraph("Ref: Agreement dated " + invoice.getProject().getStartDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))).setFontSize(10));
            }
        }

        clientProjectTable.addCell(billToCell);
        clientProjectTable.addCell(projectCell);
        
        document.add(clientProjectTable);
        document.add(new Paragraph("\n"));
    }

    private void addLineItems(Document document, Invoice invoice) {
        // Items table
        Table itemsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1}))
                .setWidth(UnitValue.createPercentValue(100));

        // Header row
        itemsTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
        itemsTable.addHeaderCell(new Cell().add(new Paragraph("Quantity").setBold()).setTextAlignment(TextAlignment.RIGHT));
        itemsTable.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setBold()).setTextAlignment(TextAlignment.RIGHT));
        itemsTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()).setTextAlignment(TextAlignment.RIGHT));

        // Add items
        for (InvoiceItem item : invoice.getItems()) {
            itemsTable.addCell(new Cell().add(new Paragraph(item.getDescription())));
            itemsTable.addCell(new Cell().add(new Paragraph(formatNumber(item.getQuantity()))).setTextAlignment(TextAlignment.RIGHT));
            itemsTable.addCell(new Cell().add(new Paragraph(formatCurrency(item.getUnitPrice()))).setTextAlignment(TextAlignment.RIGHT));
            itemsTable.addCell(new Cell().add(new Paragraph(formatCurrency(item.getAmount()))).setTextAlignment(TextAlignment.RIGHT));
        }

        document.add(itemsTable);
        document.add(new Paragraph("\n"));
    }

    private void addTotals(Document document, Invoice invoice) {
        // Totals table (right-aligned)
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .setWidth(UnitValue.createPercentValue(50))
                .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

        // Subtotal / Taxable Value
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Total Taxable Value:")));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getSubtotal()))).setTextAlignment(TextAlignment.RIGHT));

        // GST - Show CGST/SGST or IGST based on what's applied
        boolean hasGst = false;
        if (invoice.getCgstRate() != null && invoice.getCgstRate().compareTo(BigDecimal.ZERO) > 0) {
            hasGst = true;
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Add: CGST @ " + formatNumber(invoice.getCgstRate()) + "%:")));
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getCgstAmount()))).setTextAlignment(TextAlignment.RIGHT));
        }
        if (invoice.getSgstRate() != null && invoice.getSgstRate().compareTo(BigDecimal.ZERO) > 0) {
            hasGst = true;
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Add: SGST @ " + formatNumber(invoice.getSgstRate()) + "%:")));
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getSgstAmount()))).setTextAlignment(TextAlignment.RIGHT));
        }
        if (invoice.getIgstRate() != null && invoice.getIgstRate().compareTo(BigDecimal.ZERO) > 0) {
            hasGst = true;
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Add: IGST @ " + formatNumber(invoice.getIgstRate()) + "%:")));
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getIgstAmount()))).setTextAlignment(TextAlignment.RIGHT));
        }
        
        // Fall back to simple tax if GST not set
        if (!hasGst && invoice.getTaxRate() != null && invoice.getTaxRate().compareTo(BigDecimal.ZERO) > 0) {
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Tax (" + formatNumber(invoice.getTaxRate()) + "%):")));
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getTaxAmount()))).setTextAlignment(TextAlignment.RIGHT));
        }

        // Total
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("GRAND TOTAL:").setBold()));
        totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getTotalAmount())).setBold()).setTextAlignment(TextAlignment.RIGHT));

        // Paid amount (if any)
        if (invoice.getPaidAmount() != null && invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Paid:")));
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getPaidAmount()))).setTextAlignment(TextAlignment.RIGHT));

            // Balance
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Balance Due:").setBold()));
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph(formatCurrency(invoice.getBalanceAmount())).setBold()).setTextAlignment(TextAlignment.RIGHT));
        }

        document.add(totalsTable);
        document.add(new Paragraph("\n"));
    }

    private void addFooter(Document document, Invoice invoice) {
        Organization org = invoice.getOrganization();
        
        // Notes
        if (invoice.getNotes() != null && !invoice.getNotes().trim().isEmpty()) {
            document.add(new Paragraph("Notes:").setBold().setMarginTop(20));
            document.add(new Paragraph(invoice.getNotes()).setFontSize(10));
            document.add(new Paragraph("\n"));
        }

        // Terms and conditions
        document.add(new Paragraph("Payment Terms:").setBold().setMarginTop(10));
        if (invoice.getTermsAndConditions() != null && !invoice.getTermsAndConditions().trim().isEmpty()) {
            document.add(new Paragraph(invoice.getTermsAndConditions()).setFontSize(9));
        } else {
            // Default terms
            document.add(new Paragraph("Payment is due within " + 
                java.time.temporal.ChronoUnit.DAYS.between(invoice.getIssueDate(), invoice.getDueDate()) + 
                " days of invoice date.").setFontSize(9));
        }
        
        // Bank details
        if (org.getBankName() != null || org.getBankAccountNumber() != null) {
            document.add(new Paragraph("\nBank Details:").setBold().setMarginTop(10));
            StringBuilder bankDetails = new StringBuilder();
            if (org.getBankName() != null) {
                bankDetails.append("Bank: ").append(org.getBankName());
            }
            if (org.getBankAccountNumber() != null) {
                if (bankDetails.length() > 0) bankDetails.append(" | ");
                bankDetails.append("A/c No: ").append(org.getBankAccountNumber());
            }
            if (org.getBankIfsc() != null) {
                if (bankDetails.length() > 0) bankDetails.append(" | ");
                bankDetails.append("IFSC: ").append(org.getBankIfsc());
            }
            if (org.getBankBranch() != null) {
                if (bankDetails.length() > 0) bankDetails.append(" | ");
                bankDetails.append("Branch: ").append(org.getBankBranch());
            }
            document.add(new Paragraph(bankDetails.toString()).setFontSize(9));
            
            if (org.getBankAccountName() != null) {
                document.add(new Paragraph("Please make payments via NEFT/RTGS/Cheque in favour of \"" + org.getBankAccountName() + "\".").setFontSize(9));
            }
            document.add(new Paragraph("Please deduct TDS u/s 194J (10% for individuals/firms, as applicable) and provide the TDS certificate.").setFontSize(9));
        }

        // Thank you message with signature
        document.add(new Paragraph("\nFor " + org.getName())
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30));
        document.add(new Paragraph("\n\n_________________________")
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("(Authorized Signatory)")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10));
    }

    private String formatCurrency(BigDecimal amount) {
        return amount != null ? CURRENCY_FORMATTER.format(amount) : "₹0.00";
    }

    private String formatNumber(BigDecimal number) {
        return number != null ? number.stripTrailingZeros().toPlainString() : "0";
    }

    private void addLogoToCell(Cell cell) {
        try {
            ClassPathResource logoResource = new ClassPathResource(DEFAULT_LOGO_PATH);
            if (logoResource.exists()) {
                try (InputStream logoStream = logoResource.getInputStream()) {
                    byte[] logoBytes = logoStream.readAllBytes();
                    ImageData logoImageData = ImageDataFactory.create(logoBytes);
                    Image logo = new Image(logoImageData);
                    
                    // Scale logo to appropriate size for invoice header
                    logo.setWidth(100);
                    logo.setHeight(60);
                    logo.setHorizontalAlignment(HorizontalAlignment.LEFT);
                    
                    cell.add(logo);
                    cell.add(new Paragraph("\n").setFontSize(6)); // Small spacing after logo
                    
                    logger.debug("Successfully added logo to PDF");
                } catch (IOException e) {
                    logger.warn("Error reading logo file: {}", e.getMessage());
                }
            } else {
                logger.warn("Logo file not found at path: {}", DEFAULT_LOGO_PATH);
            }
        } catch (Exception e) {
            logger.warn("Could not load logo image: {}", e.getMessage());
            // Continue without logo - this ensures PDF generation doesn't fail
        }
    }

    /**
     * Generate PDF for payslip
     */
    public byte[] generatePayslipPdf(Payslip payslip) {
        logger.info("Generating PDF for payslip: {}", payslip.getPayslipNumber());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfDocument pdfDoc = new PdfDocument(new PdfWriter(baos));
            Document document = new Document(pdfDoc);

            // Add header
            addPayslipHeader(document, payslip);

            // Add employee details
            addPayslipEmployeeDetails(document, payslip);

            // Add pay period details
            addPayslipPayPeriod(document, payslip);

            // Add salary breakdown
            addPayslipSalaryBreakdown(document, payslip);

            // Add deductions
            addPayslipDeductions(document, payslip);

            // Add net salary summary
            addPayslipNetSalary(document, payslip);

            // Add footer
            addPayslipFooter(document, payslip);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            logger.error("Error generating payslip PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate payslip PDF", e);
        }
    }

    private void addPayslipHeader(Document document, Payslip payslip) {
        Table headerTable = new Table(2).useAllAvailableWidth();
        
        // Left cell with logo and organization info
        Cell leftCell = new Cell();
        addLogoToCell(leftCell);
        leftCell.add(new Paragraph(payslip.getOrganizationName()).setBold().setFontSize(16));
        if (payslip.getOrganization().getAddress() != null) {
            leftCell.add(new Paragraph(payslip.getOrganization().getAddress()).setFontSize(10));
        }
        headerTable.addCell(leftCell);

        // Right cell with payslip details
        Cell rightCell = new Cell();
        rightCell.setTextAlignment(TextAlignment.RIGHT);
        rightCell.add(new Paragraph("PAYSLIP").setBold().setFontSize(24).setTextAlignment(TextAlignment.CENTER));
        rightCell.add(new Paragraph("Payslip #: " + payslip.getPayslipNumber()).setFontSize(12));
        rightCell.add(new Paragraph("Period: " + payslip.getPayPeriodStart().format(DATE_FORMATTER) + " - " + 
                                  payslip.getPayPeriodEnd().format(DATE_FORMATTER)).setFontSize(12));
        rightCell.add(new Paragraph("Generated on: " + payslip.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))).setFontSize(12));
        headerTable.addCell(rightCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayslipEmployeeDetails(Document document, Payslip payslip) {
        Table employeeTable = new Table(2).useAllAvailableWidth();
        
        Cell leftCell = new Cell();
        leftCell.add(new Paragraph("Employee Details").setBold().setFontSize(14).setMarginBottom(10));
        leftCell.add(new Paragraph("Name: " + payslip.getUserName()).setFontSize(12));
        leftCell.add(new Paragraph("Employee ID: " + payslip.getUserId()).setFontSize(12));
        if (payslip.getUser().getDesignation() != null) {
            leftCell.add(new Paragraph("Designation: " + payslip.getUser().getDesignation()).setFontSize(12));
        }
        employeeTable.addCell(leftCell);

        Cell rightCell = new Cell();
        rightCell.add(new Paragraph("Salary Information").setBold().setFontSize(14).setMarginBottom(10));
        // Calculate monthly salary from daily salary and working days in period
        long totalWorkingDaysInPeriod = calculateWorkingDaysInPeriod(payslip.getPayPeriodStart(), payslip.getPayPeriodEnd());
        BigDecimal monthlySalary = payslip.getDailySalary().multiply(BigDecimal.valueOf(totalWorkingDaysInPeriod));
        rightCell.add(new Paragraph("Monthly Salary: " + formatCurrency(monthlySalary)).setFontSize(12));
        rightCell.add(new Paragraph("Daily Rate: " + formatCurrency(payslip.getDailySalary())).setFontSize(12));
        rightCell.add(new Paragraph("Working Days in Period: " + totalWorkingDaysInPeriod).setFontSize(12));
        employeeTable.addCell(rightCell);

        document.add(employeeTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayslipPayPeriod(Document document, Payslip payslip) {
        Table periodTable = new Table(2).useAllAvailableWidth();
        
        Cell leftCell = new Cell();
        leftCell.add(new Paragraph("Pay Period").setBold().setFontSize(12));
        leftCell.add(new Paragraph("From: " + payslip.getPayPeriodStart().format(DATE_FORMATTER)).setFontSize(10));
        leftCell.add(new Paragraph("To: " + payslip.getPayPeriodEnd().format(DATE_FORMATTER)).setFontSize(10));
        periodTable.addCell(leftCell);

        Cell rightCell = new Cell();
        rightCell.add(new Paragraph("Work Summary").setBold().setFontSize(12));
        rightCell.add(new Paragraph("Days Worked: " + payslip.getDaysWorked()).setFontSize(10));
        rightCell.add(new Paragraph("Overtime Hours: " + formatNumber(payslip.getOvertimeHours())).setFontSize(10));
        periodTable.addCell(rightCell);

        document.add(periodTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayslipSalaryBreakdown(Document document, Payslip payslip) {
        document.add(new Paragraph("Earnings").setBold().setFontSize(14).setMarginBottom(10));

        Table earningsTable = new Table(3).useAllAvailableWidth();
        earningsTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
        earningsTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()).setTextAlignment(TextAlignment.RIGHT));
        earningsTable.addHeaderCell(new Cell().add(new Paragraph("Total").setBold()).setTextAlignment(TextAlignment.RIGHT));

        // Basic Salary
        earningsTable.addCell(new Cell().add(new Paragraph("Basic Salary (" + payslip.getDaysWorked() + " days @ " + 
                                                         formatCurrency(payslip.getDailySalary()) + ")").setFontSize(10)));
        earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getDailySalary())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getBasicSalary())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));

        // Overtime
        if (payslip.getOvertimeHours().compareTo(BigDecimal.ZERO) > 0) {
            earningsTable.addCell(new Cell().add(new Paragraph("Overtime (" + formatNumber(payslip.getOvertimeHours()) + " hrs @ " + 
                                                             formatCurrency(payslip.getOvertimeRate()) + ")").setFontSize(10)));
            earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getOvertimeRate())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getOvertimeAmount())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        }

        // Allowances
        if (payslip.getAllowances().compareTo(BigDecimal.ZERO) > 0) {
            earningsTable.addCell(new Cell().add(new Paragraph("Allowances").setFontSize(10)));
            earningsTable.addCell(new Cell().add(new Paragraph("").setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getAllowances())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        }

        // Bonuses
        if (payslip.getBonuses().compareTo(BigDecimal.ZERO) > 0) {
            earningsTable.addCell(new Cell().add(new Paragraph("Bonuses").setFontSize(10)));
            earningsTable.addCell(new Cell().add(new Paragraph("").setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getBonuses())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        }

        // Total Gross Salary
        earningsTable.addCell(new Cell().add(new Paragraph("TOTAL GROSS SALARY").setBold().setFontSize(12)));
        earningsTable.addCell(new Cell().add(new Paragraph("").setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        earningsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getGrossSalary())).setBold().setFontSize(12)).setTextAlignment(TextAlignment.RIGHT));

        document.add(earningsTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayslipDeductions(Document document, Payslip payslip) {
        document.add(new Paragraph("Deductions").setBold().setFontSize(14).setMarginBottom(10));

        Table deductionsTable = new Table(3).useAllAvailableWidth();
        deductionsTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
        deductionsTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()).setTextAlignment(TextAlignment.RIGHT));
        deductionsTable.addHeaderCell(new Cell().add(new Paragraph("Total").setBold()).setTextAlignment(TextAlignment.RIGHT));

        // Tax Deduction
        if (payslip.getTaxDeduction().compareTo(BigDecimal.ZERO) > 0) {
            deductionsTable.addCell(new Cell().add(new Paragraph("Tax Deduction").setFontSize(10)));
            deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getTaxDeduction())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getTaxDeduction())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        }

        // Insurance Deduction
        if (payslip.getInsuranceDeduction().compareTo(BigDecimal.ZERO) > 0) {
            deductionsTable.addCell(new Cell().add(new Paragraph("Insurance Deduction").setFontSize(10)));
            deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getInsuranceDeduction())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getInsuranceDeduction())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        }

        // Other Deductions
        if (payslip.getOtherDeductions().compareTo(BigDecimal.ZERO) > 0) {
            deductionsTable.addCell(new Cell().add(new Paragraph("Other Deductions").setFontSize(10)));
            deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getOtherDeductions())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getOtherDeductions())).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        }

        // Total Deductions
        deductionsTable.addCell(new Cell().add(new Paragraph("TOTAL DEDUCTIONS").setBold().setFontSize(12)));
        deductionsTable.addCell(new Cell().add(new Paragraph("").setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
        deductionsTable.addCell(new Cell().add(new Paragraph(formatCurrency(payslip.getTotalDeductions())).setBold().setFontSize(12)).setTextAlignment(TextAlignment.RIGHT));

        document.add(deductionsTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayslipNetSalary(Document document, Payslip payslip) {
        Table netSalaryTable = new Table(2).useAllAvailableWidth();
        
        Cell leftCell = new Cell();
        leftCell.add(new Paragraph("NET SALARY").setBold().setFontSize(16));
        leftCell.add(new Paragraph("Amount payable to employee").setFontSize(10));
        netSalaryTable.addCell(leftCell);

        Cell rightCell = new Cell();
        rightCell.setTextAlignment(TextAlignment.RIGHT);
        rightCell.add(new Paragraph(formatCurrency(payslip.getNetSalary())).setBold().setFontSize(20));
        netSalaryTable.addCell(rightCell);

        document.add(netSalaryTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayslipFooter(Document document, Payslip payslip) {
        if (payslip.getNotes() != null && !payslip.getNotes().trim().isEmpty()) {
            document.add(new Paragraph("Notes:").setBold().setMarginTop(20));
            document.add(new Paragraph(payslip.getNotes()).setFontSize(10));
            document.add(new Paragraph("\n"));
        }

        // Thank you message
        document.add(new Paragraph("Thank you for your service!")
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setItalic());
    }

    /**
     * Calculate working days in a period (excluding weekends)
     */
    private long calculateWorkingDaysInPeriod(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        long workingDays = 0;
        java.time.LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            // Check if it's a weekday (Monday = 1, Sunday = 7)
            int dayOfWeek = currentDate.getDayOfWeek().getValue();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                workingDays++;
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return workingDays;
    }
}
