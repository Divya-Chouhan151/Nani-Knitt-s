package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.ChangePasswordRequest;
import com.ecommerce.auth.dto.request.TwoFactorVerifyRequest;
import com.ecommerce.auth.dto.response.SessionResponse;
import com.ecommerce.auth.dto.response.TwoFactorSetupResponse;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.SecurityManagementService;
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

@WebMvcTest(SecurityController.class)
@AutoConfigureMockMvc(addFilters = false)
class SecurityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SecurityManagementService securityManagementService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void changePassword_shouldReturnOk() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword123!")
                .newPassword("NewSecurePass456!")
                .confirmPassword("NewSecurePass456!")
                .build();

        mockMvc.perform(post("/api/v1/profile/security/password")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        verify(securityManagementService).changePassword(eq("user@aura.com"), any(ChangePasswordRequest.class));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void getSessions_shouldReturnList() throws Exception {
        SessionResponse s = SessionResponse.builder()
                .id(UUID.randomUUID())
                .ipAddress("127.0.0.1")
                .userAgent("Mozilla/5.0")
                .createdAt(Instant.now())
                .isCurrent(true)
                .build();

        when(securityManagementService.getActiveSessions(eq("user@aura.com"))).thenReturn(List.of(s));

        mockMvc.perform(get("/api/v1/profile/security/sessions")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ipAddress").value("127.0.0.1"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void setup2Fa_shouldReturnSecretAndUri() throws Exception {
        TwoFactorSetupResponse resp = TwoFactorSetupResponse.builder()
                .secret("JBSWY3DPEHPK3PXP")
                .otpAuthUri("otpauth://totp/AuraCommerce:user@aura.com?secret=JBSWY3DPEHPK3PXP")
                .backupCodes(List.of("code1", "code2"))
                .build();

        when(securityManagementService.initiate2FaSetup(eq("user@aura.com"))).thenReturn(resp);

        mockMvc.perform(post("/api/v1/profile/security/2fa/setup")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").value("JBSWY3DPEHPK3PXP"))
                .andExpect(jsonPath("$.backupCodes").isArray());
    }
}
