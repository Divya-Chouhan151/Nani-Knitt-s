package com.ecommerce.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDto {
    private UUID id;
    private String orderNumber;
    private String status;
    private String currency;
    private BigDecimal totalAmount;
    private int itemCount;
    private String firstItemTitle;
    private String firstItemImageUrl;
    private LocalDate estimatedDelivery;
    private Instant createdAt;
}
