package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.response.VpaValidationResponse;

public interface PaymentGatewayService {

    VpaValidationResponse validateVpa(String vpa);
}
