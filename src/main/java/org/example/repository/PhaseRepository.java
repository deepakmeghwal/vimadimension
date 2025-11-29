package org.example.repository;

import org.example.models.Phase;
import org.example.models.enums.PhaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhaseRepository extends JpaRepository<Phase, Long> {
    List<Phase> findByProjectId(Long projectId);
    List<Phase> findByProjectIdAndStatus(Long projectId, PhaseStatus status);
}
