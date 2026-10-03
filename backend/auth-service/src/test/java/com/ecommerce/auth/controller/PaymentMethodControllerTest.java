package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.AddUpiPaymentMethodRequest;
import com.ecommerce.auth.dto.request.ValidateVpaRequest;
import com.ecommerce.auth.dto.response.PaymentMethodResponse;
import com.ecommerce.auth.dto.response.VpaValidationResponse;
import com.ecommerce.auth.entity.PaymentMethodType;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.PaymentMethodService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentMethodController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentMethodControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentMethodService paymentMethodService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void getPaymentMethods_shouldReturnList() throws Exception {
        UUID id = UUID.randomUUID();
        PaymentMethodResponse res = PaymentMethodResponse.builder()
                .id(id)
                .type(PaymentMethodType.UPI)
                .vpa("user@okhdfcbank")
                .maskedVpa("use***@okhdfcbank")
                .accountHolderName("User Account")
                .bankName("HDFC Bank")
                .isVerified(true)
                .isDefault(true)
                .createdAt(Instant.now())
                .build();

        when(paymentMethodService.getPaymentMethods("user@aura.com")).thenReturn(List.of(res));

        mockMvc.perform(get("/api/v1/profile/payment-methods")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vpa").value("user@okhdfcbank"))
                .andExpect(jsonPath("$[0].maskedVpa").value("use***@okhdfcbank"))
                .andExpect(jsonPath("$[0].isDefault").value(true));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void validateVpa_shouldReturnValidationResult() throws Exception {
        ValidateVpaRequest req = new ValidateVpaRequest("priya@okaxis");
        VpaValidationResponse res = VpaValidationResponse.builder()
                .vpa("priya@okaxis")
                .isValid(true)
                .accountHolderName("Priya")
                .bankName("Axis Bank")
                .gatewayReferenceId("tok_123")
                .build();

        when(paymentMethodService.validateVpa(eq("user@aura.com"), any(ValidateVpaRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/v1/profile/payment-methods/validate-vpa")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isValid").value(true))
                .andExpect(jsonPath("$.accountHolderName").value("Priya"))
                .andExpect(jsonPath("$.bankName").value("Axis Bank"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void addUpiPaymentMethod_shouldReturnCreated() throws Exception {
        AddUpiPaymentMethodRequest req = new AddUpiPaymentMethodRequest("rahul@oksbi", true);
        UUID id = UUID.randomUUID();
        PaymentMethodResponse res = PaymentMethodResponse.builder()
                .id(id)
                .type(PaymentMethodType.UPI)
                .vpa("rahul@oksbi")
                .maskedVpa("rah***@oksbi")
                .accountHolderName("Rahul")
                .bankName("State Bank of India")
                .isVerified(true)
                .isDefault(true)
                .createdAt(Instant.now())
                .build();

        when(paymentMethodService.addUpiPaymentMethod(eq("user@aura.com"), any(AddUpiPaymentMethodRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/v1/profile/payment-methods/upi")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vpa").value("rahul@oksbi"))
                .andExpect(jsonPath("$.isVerified").value(true));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void setDefaultPaymentMethod_shouldReturnUpdated() throws Exception {
        UUID id = UUID.randomUUID();
        PaymentMethodResponse res = PaymentMethodResponse.builder()
                .id(id)
                .type(PaymentMethodType.UPI)
                .vpa("user@okhdfcbank")
                .isDefault(true)
                .build();

        when(paymentMethodService.setDefaultPaymentMethod("user@aura.com", id)).thenReturn(res);

        mockMvc.perform(patch("/api/v1/profile/payment-methods/" + id + "/default")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isDefault").value(true));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void deletePaymentMethod_shouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/profile/payment-methods/" + id)
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isNoContent());

        verify(paymentMethodService).deletePaymentMethod("user@aura.com", id);
    }
}
