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
public class ReturnRequestResponse {
    private UUID id;
    private UUID orderId;
    private String reason;
    private String status;
    private Instant requestedAt;
    private Instant resolvedAt;
    private String resolutionNotes;
}
