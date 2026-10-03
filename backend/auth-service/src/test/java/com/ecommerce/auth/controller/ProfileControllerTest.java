package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.ConfirmPhoneChangeRequest;
import com.ecommerce.auth.dto.request.InitiateEmailChangeRequest;
import com.ecommerce.auth.dto.request.InitiatePhoneChangeRequest;
import com.ecommerce.auth.dto.request.UpdateProfileRequest;
import com.ecommerce.auth.dto.response.UserResponse;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void updateProfile_shouldReturnUpdatedUser() throws Exception {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .firstName("Jane")
                .lastName("Smith")
                .phoneNumber("+919876543210")
                .optionalPhoneNumber("+919876543211")
                .dob(LocalDate.of(1995, 5, 20))
                .gender("FEMALE")
                .build();

        UserResponse response = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@aura.com")
                .firstName("Jane")
                .lastName("Smith")
                .phoneNumber("+919876543210")
                .optionalPhoneNumber("+919876543211")
                .dob(LocalDate.of(1995, 5, 20))
                .gender("FEMALE")
                .roles(Set.of("ROLE_CUSTOMER"))
                .build();

        when(profileService.updateProfile(eq("user@aura.com"), any(UpdateProfileRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/profile")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.phoneNumber").value("+919876543210"))
                .andExpect(jsonPath("$.optionalPhoneNumber").value("+919876543211"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void uploadAvatar_shouldReturnAvatarUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", "fake-img".getBytes());

        when(profileService.uploadAvatar(eq("user@aura.com"), any())).thenReturn("/uploads/avatars/test.png");

        mockMvc.perform(multipart("/api/v1/profile/avatar")
                        .file(file)
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("/uploads/avatars/test.png"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void initiatePhoneChange_shouldReturnSuccessMessage() throws Exception {
        InitiatePhoneChangeRequest request = new InitiatePhoneChangeRequest("+919876543210");

        mockMvc.perform(post("/api/v1/profile/phone/initiate")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        verify(profileService).initiatePhoneChange(eq("user@aura.com"), eq("+919876543210"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void confirmPhoneChange_shouldReturnUpdatedUser() throws Exception {
        ConfirmPhoneChangeRequest request = new ConfirmPhoneChangeRequest("123456");

        UserResponse response = UserResponse.builder()
                .email("user@aura.com")
                .phoneNumber("+919876543210")
                .phoneVerified(true)
                .build();

        when(profileService.confirmPhoneChange(eq("user@aura.com"), eq("123456"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/profile/phone/confirm")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phoneVerified").value(true));
    }
}
