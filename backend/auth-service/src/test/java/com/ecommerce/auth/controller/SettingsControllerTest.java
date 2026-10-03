package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.AccountDeactivationRequest;
import com.ecommerce.auth.dto.response.UserSettingsDto;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.SettingsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SettingsController.class)
@AutoConfigureMockMvc(addFilters = false)
class SettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SettingsService settingsService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void getSettings_shouldReturnSettings() throws Exception {
        UserSettingsDto dto = UserSettingsDto.builder()
                .emailNotifications(true)
                .smsNotifications(false)
                .pushNotifications(true)
                .language("en")
                .currency("INR")
                .build();

        when(settingsService.getSettings(eq("user@aura.com"))).thenReturn(dto);

        mockMvc.perform(get("/api/v1/profile/settings")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.smsNotifications").value(false));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void updateSettings_shouldReturnUpdated() throws Exception {
        UserSettingsDto dto = UserSettingsDto.builder()
                .emailNotifications(false)
                .smsNotifications(false)
                .pushNotifications(false)
                .language("en")
                .currency("USD")
                .build();

        when(settingsService.updateSettings(eq("user@aura.com"), any(UserSettingsDto.class))).thenReturn(dto);

        mockMvc.perform(put("/api/v1/profile/settings")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void requestAccountDeletion_shouldReturnAccepted() throws Exception {
        AccountDeactivationRequest req = AccountDeactivationRequest.builder()
                .password("Password123!")
                .confirmation("DELETE")
                .build();

        mockMvc.perform(post("/api/v1/profile/settings/deactivate")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        verify(settingsService).requestAccountDeletion(eq("user@aura.com"), any(AccountDeactivationRequest.class));
    }
}
