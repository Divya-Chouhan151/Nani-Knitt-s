package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AddUpiPaymentMethodRequest;
import com.ecommerce.auth.dto.request.ValidateVpaRequest;
import com.ecommerce.auth.dto.response.PaymentMethodResponse;
import com.ecommerce.auth.dto.response.VpaValidationResponse;

import java.util.List;
import java.util.UUID;

public interface PaymentMethodService {

    List<PaymentMethodResponse> getPaymentMethods(String email);

    VpaValidationResponse validateVpa(String email, ValidateVpaRequest request);

    PaymentMethodResponse addUpiPaymentMethod(String email, AddUpiPaymentMethodRequest request);

    PaymentMethodResponse setDefaultPaymentMethod(String email, UUID paymentMethodId);

    void deletePaymentMethod(String email, UUID paymentMethodId);
}
