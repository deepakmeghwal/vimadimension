package org.example.repository;

import org.example.models.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByOrganizationId(Long organizationId);
    Optional<Client> findByOrganizationIdAndId(Long organizationId, Long id);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Client c WHERE c.organization.id = :organizationId AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Client> searchClients(@org.springframework.data.repository.query.Param("organizationId") Long organizationId, @org.springframework.data.repository.query.Param("query") String query);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Client c WHERE c.organization.id = :organizationId AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    org.springframework.data.domain.Page<Client> searchClientsPaginated(@org.springframework.data.repository.query.Param("organizationId") Long organizationId, @org.springframework.data.repository.query.Param("query") String query, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Client> findByOrganizationId(Long organizationId, org.springframework.data.domain.Pageable pageable);

    boolean existsByOrganizationIdAndCode(Long organizationId, String code);
}
