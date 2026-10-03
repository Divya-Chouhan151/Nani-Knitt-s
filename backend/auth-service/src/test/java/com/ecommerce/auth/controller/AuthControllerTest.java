package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.LoginRequest;
import com.ecommerce.auth.dto.request.RegisterRequest;
import com.ecommerce.auth.dto.response.AuthResponse;
import com.ecommerce.auth.dto.response.UserResponse;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    void register_shouldReturnCreated() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@aura.com")
                .password("Password123!")
                .firstName("John")
                .lastName("Doe")
                .build();

        AuthResponse mockResponse = AuthResponse.builder()
                .accessToken("test_jwt")
                .tokenType("Bearer")
                .expiresIn(900)
                .user(UserResponse.builder()
                        .id(UUID.randomUUID())
                        .email("test@aura.com")
                        .firstName("John")
                        .lastName("Doe")
                        .roles(Set.of("ROLE_CUSTOMER"))
                        .build())
                .build();

        when(authService.register(any(), any(), any(), any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("test_jwt"))
                .andExpect(jsonPath("$.user.email").value("test@aura.com"));
    }

    @Test
    void login_shouldReturnOk() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@aura.com")
                .password("Password123!")
                .build();

        AuthResponse mockResponse = AuthResponse.builder()
                .accessToken("test_jwt")
                .tokenType("Bearer")
                .expiresIn(900)
                .user(UserResponse.builder()
                        .email("test@aura.com")
                        .build())
                .build();

        when(authService.login(any(), any(), any(), any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("test_jwt"));
    }

    @Test
    void refresh_shouldReturnOk() throws Exception {
        AuthResponse mockResponse = AuthResponse.builder()
                .accessToken("refreshed_jwt")
                .tokenType("Bearer")
                .expiresIn(900)
                .build();

        when(authService.refresh(eq("sample-cookie-token"), any(), any(), any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new Cookie("refreshToken", "sample-cookie-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("refreshed_jwt"));
    }

    @Test
    void logout_shouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(new Cookie("refreshToken", "sample-cookie-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully logged out"));

        verify(authService).logout(eq("sample-cookie-token"), any(), any(), any());
    }

    @Test
    void me_shouldReturnCurrentUser() throws Exception {
        UserResponse mockUser = UserResponse.builder()
                .email("customer@aura.com")
                .firstName("Alex")
                .roles(Set.of("ROLE_CUSTOMER"))
                .build();

        when(authService.getCurrentUser("customer@aura.com")).thenReturn(mockUser);

        mockMvc.perform(get("/api/v1/auth/me")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("customer@aura.com").roles("CUSTOMER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("customer@aura.com"))
                .andExpect(jsonPath("$.firstName").value("Alex"));
    }
}
