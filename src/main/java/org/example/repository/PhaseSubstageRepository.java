package org.example.repository;

import org.example.models.PhaseSubstage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhaseSubstageRepository extends JpaRepository<PhaseSubstage, Long> {

    /**
     * Find all substages for a phase, ordered by display order
     */
    List<PhaseSubstage> findByPhase_IdOrderByDisplayOrderAsc(Long phaseId);

    /**
     * Count incomplete substages for a phase
     */
    @Query("SELECT COUNT(s) FROM PhaseSubstage s WHERE s.phase.id = :phaseId AND s.isCompleted = false")
    long countIncompleteByPhaseId(@Param("phaseId") Long phaseId);

    /**
     * Count total substages for a phase
     */
    @Query("SELECT COUNT(s) FROM PhaseSubstage s WHERE s.phase.id = :phaseId")
    long countByPhaseId(@Param("phaseId") Long phaseId);

    /**
     * Check if all substages are complete for a phase
     */
    @Query("SELECT CASE WHEN COUNT(s) = 0 THEN true ELSE false END FROM PhaseSubstage s WHERE s.phase.id = :phaseId AND s.isCompleted = false")
    boolean areAllCompleteByPhaseId(@Param("phaseId") Long phaseId);

    /**
     * Delete all substages for a phase
     */
    void deleteByPhase_Id(Long phaseId);

    /**
     * Find substages by phase ID and completion status
     */
    List<PhaseSubstage> findByPhase_IdAndIsCompleted(Long phaseId, Boolean isCompleted);
}
