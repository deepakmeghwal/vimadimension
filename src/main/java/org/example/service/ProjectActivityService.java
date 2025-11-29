package org.example.service;

import org.example.dto.ProjectActivityDto;
import org.example.models.Project;
import org.example.models.ProjectActivity;
import org.example.models.User;
import org.example.models.enums.ActivityType;
import org.example.repository.ProjectActivityRepository;
import org.example.repository.ProjectRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectActivityService {

    @Autowired
    private ProjectActivityRepository projectActivityRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProjectActivity> getActivitiesByProjectId(Long projectId) {
        return projectActivityRepository.findByProjectIdOrderByActivityDateDesc(projectId);
    }

    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getRecentActivitiesByProjectId(Long projectId) {
        List<ProjectActivity> activities = projectActivityRepository.findTop10ByProjectIdOrderByActivityDateDesc(projectId);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectActivity createActivity(Long projectId, String username, ActivityType type, String description) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProjectActivity activity = new ProjectActivity(type, description, project, user);
        return projectActivityRepository.save(activity);
    }
}
