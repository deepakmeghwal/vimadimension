package org.example.repository;

import org.example.models.ResourceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceAssignmentRepository extends JpaRepository<ResourceAssignment, Long> {
    // Use nested property path: phase.id (Spring Data JPA convention)
    List<ResourceAssignment> findByPhase_Id(Long phaseId);
    List<ResourceAssignment> findByUser_Id(Long userId);
    
    @Query("SELECT ra FROM ResourceAssignment ra WHERE ra.phase.project.id = :projectId")
    List<ResourceAssignment> findByProjectId(@Param("projectId") Long projectId);
    
    Optional<ResourceAssignment> findByPhase_IdAndUser_Id(Long phaseId, Long userId);
    boolean existsByPhase_IdAndUser_Id(Long phaseId, Long userId);
}

