package com.ecommerce.auth.service;

import com.ecommerce.auth.entity.SecurityAuditLog;
import com.ecommerce.auth.repository.SecurityAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final SecurityAuditLogRepository auditLogRepository;

    @Transactional
    public void logEvent(UUID userId, String eventType, String status, String ipAddress, String userAgent, String details) {
        try {
            SecurityAuditLog logEntry = SecurityAuditLog.builder()
                    .userId(userId)
                    .eventType(eventType)
                    .status(status)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(details)
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist security audit log for event: {}", eventType, e);
        }
    }
}
