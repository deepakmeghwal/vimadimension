// src/main/java/org/example/repository/ProjectRepository.java
package org.example.repository;

import org.example.models.Project;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectChargeType;
import org.example.models.enums.ProjectPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Example derived query:
    // Organization-scoped queries to prevent cross-tenant data access
    Optional<Project> findByOrganization_IdAndName(Long organizationId, String name);
    List<Project> findByOrganization_IdAndNameContainingIgnoreCase(Long organizationId, String nameFragment);
    
    // Organization-based queries - using correct JPA property path
    long countByOrganization_Id(Long organizationId);
    long countByOrganization_IdAndStatusNot(Long organizationId, ProjectStatus status);
    
    // Pagination and filtering methods
    Page<Project> findByOrganization_Id(Long organizationId, Pageable pageable);
    
    @Query(value = "SELECT p FROM Project p LEFT JOIN FETCH p.client WHERE p.organization.id = :organizationId " +
           "AND (:chargeType IS NULL OR p.chargeType = :chargeType) " +
           "AND (:priority IS NULL OR p.priority = :priority) " +
           "AND (:status IS NULL OR p.status = :status)",
           countQuery = "SELECT COUNT(p) FROM Project p WHERE p.organization.id = :organizationId " +
           "AND (:chargeType IS NULL OR p.chargeType = :chargeType) " +
           "AND (:priority IS NULL OR p.priority = :priority) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Project> findByOrganizationAndFilters(@Param("organizationId") Long organizationId,
                                               @Param("chargeType") ProjectChargeType chargeType,
                                               @Param("priority") ProjectPriority priority,
                                               @Param("status") ProjectStatus status,
                                               Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.organization.id = :organizationId " +
           "AND (:chargeType IS NULL OR p.chargeType = :chargeType) " +
           "AND (:priority IS NULL OR p.priority = :priority) " +
           "AND (:status IS NULL OR p.status = :status)")
    long countByOrganizationAndFilters(@Param("organizationId") Long organizationId,
                                       @Param("chargeType") ProjectChargeType chargeType,
                                       @Param("priority") ProjectPriority priority,
                                       @Param("status") ProjectStatus status);
    
    // Method to find the latest project number starting with a given prefix (for auto-generation)
    Optional<Project> findTopByOrganization_IdAndProjectNumberStartingWithOrderByProjectNumberDesc(Long organizationId, String prefix);
    
    // Financial Health Dashboard Queries
    
    // Get project count by charge type for active projects
    @Query("SELECT p.chargeType, COUNT(p) FROM Project p " +
           "WHERE p.organization.id = :organizationId " +
           "AND p.status IN ('ACTIVE', 'PROGRESS') " +
           "GROUP BY p.chargeType")
    List<Object[]> getActiveProjectCountByChargeType(@Param("organizationId") Long organizationId);

    // Get project count by stage for active projects
    @Query("SELECT p.projectStage, COUNT(p) FROM Project p " +
           "WHERE p.organization.id = :organizationId " +
           "AND p.status IN ('ACTIVE', 'PROGRESS') " +
           "GROUP BY p.projectStage")
    List<Object[]> getActiveProjectCountByStage(@Param("organizationId") Long organizationId);
    
    // Get budget and actual cost stats for active projects
    @Query("SELECT COALESCE(SUM(p.budget), 0), COALESCE(SUM(p.actualCost), 0) " +
           "FROM Project p " +
           "WHERE p.organization.id = :organizationId " +
           "AND p.status IN ('ACTIVE', 'PROGRESS')")
    Object[] getBudgetStatsForActiveProjects(@Param("organizationId") Long organizationId);
    
    // Count active projects (ACTIVE or PROGRESS) - single query to avoid double counting
    @Query("SELECT COUNT(p) FROM Project p " +
           "WHERE p.organization.id = :organizationId " +
           "AND p.status IN ('ACTIVE', 'PROGRESS')")
    long countActiveProjectsByOrganization(@Param("organizationId") Long organizationId);
}