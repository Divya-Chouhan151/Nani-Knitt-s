package com.ecommerce.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VpaValidationResponse {
    private String vpa;
    private Boolean isValid;
    private String accountHolderName;
    private String bankName;
    private String gatewayReferenceId;
    private String message;
}
