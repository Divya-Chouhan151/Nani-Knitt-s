package com.ecommerce.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDetailDto {
    private UUID id;
    private String ticketNumber;
    private UUID orderId;
    private String category;
    private String subject;
    private String status;
    private String priority;
    private List<SupportTicketMessageDto> messages;
    private Instant createdAt;
    private Instant updatedAt;
}
