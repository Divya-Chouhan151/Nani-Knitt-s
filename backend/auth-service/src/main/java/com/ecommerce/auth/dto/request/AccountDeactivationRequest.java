package com.ecommerce.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDeactivationRequest {
    @NotBlank(message = "Password is required to confirm account deletion")
    private String password;

    @NotBlank(message = "Confirmation keyword is required")
    private String confirmation; // Must be "DELETE"
}
