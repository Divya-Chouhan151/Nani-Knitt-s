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
public class SupportTicketDto {
    private UUID id;
    private String ticketNumber;
    private UUID orderId;
    private String category;
    private String subject;
    private String status;
    private String priority;
    private Instant createdAt;
    private Instant updatedAt;
}
