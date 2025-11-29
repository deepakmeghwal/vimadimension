package org.example.config;

import org.example.service.InvoiceTemplateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(3)
public class InvoiceTemplateInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceTemplateInitializer.class);

    @Autowired
    private InvoiceTemplateService templateService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Initializing default invoice templates...");
        templateService.initializeDefaultTemplates();
        logger.info("Invoice template initialization complete.");
    }
}





