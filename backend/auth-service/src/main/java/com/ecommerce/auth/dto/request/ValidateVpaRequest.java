package com.ecommerce.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateVpaRequest {

    @NotBlank(message = "UPI ID (VPA) is required")
    @Pattern(
            regexp = "^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$",
            message = "Invalid UPI ID format (e.g. username@bank)"
    )
    private String vpa;
}
