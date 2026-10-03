package com.ecommerce.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAuditLogDto {
    private UUID id;
    private String eventType;
    private String status;
    private String ipAddress;
    private String userAgent;
    private String details;
    private Instant createdAt;
}
