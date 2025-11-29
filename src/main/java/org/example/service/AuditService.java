package org.example.service;

import org.example.models.AuditLog;
import org.example.models.Organization;
import org.example.models.User;
import org.example.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Autowired
    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logChange(User user, String entityType, Long entityId, String action, String fieldChanged, String oldValue, String newValue) {
        Organization org = user != null ? user.getOrganization() : null;
        AuditLog log = new AuditLog(entityType, entityId, action, fieldChanged, oldValue, newValue, user, org);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAuditLogs(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }
    
    public List<AuditLog> getOrganizationAuditLogs(Long organizationId) {
        return auditLogRepository.findByOrganizationIdOrderByTimestampDesc(organizationId);
    }
}


