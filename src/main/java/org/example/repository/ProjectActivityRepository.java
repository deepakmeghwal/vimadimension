package org.example.repository;

import org.example.models.ProjectActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long> {
    List<ProjectActivity> findByProjectIdOrderByActivityDateDesc(Long projectId);
    
    // Get last 10 activities (latest first)
    List<ProjectActivity> findTop10ByProjectIdOrderByActivityDateDesc(Long projectId);
}
