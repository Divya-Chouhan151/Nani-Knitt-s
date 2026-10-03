package com.ecommerce.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDto {
    private UUID id;
    private String orderNumber;
    private String status;
    private String currency;
    private BigDecimal subtotalAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String paymentStatus;
    private String trackingCarrier;
    private String trackingNumber;
    private LocalDate estimatedDelivery;
    private List<OrderItemDto> items;
    private List<OrderStatusHistoryDto> statusHistory;
    private boolean canCancel;
    private boolean canReturn;
    private Instant createdAt;
    private Instant updatedAt;
}
