package com.ecommerce.auth.dto.response;

import com.ecommerce.auth.entity.PaymentMethodType;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodResponse {
    private UUID id;
    private PaymentMethodType type;
    private String vpa;
    private String maskedVpa;
    private String accountHolderName;
    private String bankName;
    private Boolean isVerified;
    private Boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;
}
