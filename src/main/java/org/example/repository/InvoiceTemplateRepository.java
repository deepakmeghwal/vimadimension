package org.example.repository;

import org.example.models.InvoiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceTemplateRepository extends JpaRepository<InvoiceTemplate, Long> {
    List<InvoiceTemplate> findByIsActiveTrue();
    List<InvoiceTemplate> findByOrganization_IdAndIsActiveTrue(Long organizationId);
    List<InvoiceTemplate> findByOrganizationIsNullAndIsActiveTrue(); // Global templates
    Optional<InvoiceTemplate> findByTemplateCode(String templateCode);
    Optional<InvoiceTemplate> findByIsDefaultTrueAndOrganizationIsNull(); // Default global template
    Optional<InvoiceTemplate> findByIsDefaultTrueAndOrganization_Id(Long organizationId); // Default org template
}

