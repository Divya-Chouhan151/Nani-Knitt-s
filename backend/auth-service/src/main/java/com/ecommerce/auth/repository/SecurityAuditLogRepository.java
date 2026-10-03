package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.SecurityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, UUID> {
    java.util.List<SecurityAuditLog> findTop50ByUserIdOrderByCreatedAtDesc(UUID userId);
}
