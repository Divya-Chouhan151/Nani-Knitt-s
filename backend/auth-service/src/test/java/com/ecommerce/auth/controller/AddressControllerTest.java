package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.AddressRequest;
import com.ecommerce.auth.dto.response.AddressResponse;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.AddressService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AddressController.class)
@AutoConfigureMockMvc(addFilters = false)
class AddressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AddressService addressService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void getAddresses_shouldReturnList() throws Exception {
        UUID id = UUID.randomUUID();
        AddressResponse addr = AddressResponse.builder()
                .id(id)
                .label("Home")
                .fullName("John Doe")
                .phone("+919876543210")
                .addressLine1("123 Main St")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560001")
                .country("India")
                .isDefaultShipping(true)
                .isDefaultBilling(true)
                .build();

        when(addressService.getAddresses(eq("user@aura.com"))).thenReturn(List.of(addr));

        mockMvc.perform(get("/api/v1/profile/addresses")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label").value("Home"))
                .andExpect(jsonPath("$[0].isDefaultShipping").value(true));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void createAddress_shouldReturnCreated() throws Exception {
        AddressRequest request = AddressRequest.builder()
                .label("Work")
                .fullName("John Doe")
                .phone("+919876543210")
                .addressLine1("456 Tech Park")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560100")
                .country("India")
                .isDefaultShipping(false)
                .isDefaultBilling(false)
                .build();

        AddressResponse response = AddressResponse.builder()
                .id(UUID.randomUUID())
                .label("Work")
                .fullName("John Doe")
                .phone("+919876543210")
                .addressLine1("456 Tech Park")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560100")
                .country("India")
                .build();

        when(addressService.createAddress(eq("user@aura.com"), any(AddressRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/profile/addresses")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.label").value("Work"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void deleteAddress_shouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/profile/addresses/{id}", id)
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isNoContent());

        verify(addressService).deleteAddress(eq("user@aura.com"), eq(id));
    }
}
