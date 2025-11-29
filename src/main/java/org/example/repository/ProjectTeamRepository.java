package org.example.repository;

import org.example.models.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    // Use nested property path syntax for relationship fields
    List<ProjectTeam> findByProject_Id(Long projectId);
    List<ProjectTeam> findByUser_Id(Long userId);
    Optional<ProjectTeam> findByProject_IdAndUser_Id(Long projectId, Long userId);
    boolean existsByProject_IdAndUser_Id(Long projectId, Long userId);
}

