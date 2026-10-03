package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.LoginRequest;
import com.ecommerce.auth.dto.request.RegisterRequest;
import com.ecommerce.auth.dto.response.AuthResponse;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.entity.Role;
import com.ecommerce.auth.entity.RoleType;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.exception.EmailAlreadyExistsException;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.exception.TokenRefreshException;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import com.ecommerce.auth.repository.RoleRepository;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshTokenExpirationMs", 604800000L);

        customerRole = Role.builder()
                .id(1)
                .name(RoleType.ROLE_CUSTOMER)
                .description("Customer role")
                .build();

        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .email("customer@aura.com")
                .passwordHash("hashed_password")
                .firstName("Alex")
                .lastName("Morgan")
                .status("ACTIVE")
                .emailVerified(true)
                .roles(Set.of(customerRole))
                .build();
    }

    @Test
    void register_shouldSucceedForNewEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .email("newuser@aura.com")
                .password("Password123!")
                .firstName("John")
                .lastName("Doe")
                .build();

        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(roleRepository.findByName(RoleType.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_new_password");
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(sampleUser);
        when(jwtProvider.generateAccessToken(any(), any(), any())).thenReturn("mock_jwt_token");

        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthResponse authResponse = authService.register(request, response, "127.0.0.1", "TestAgent");

        assertNotNull(authResponse);
        assertEquals("mock_jwt_token", authResponse.getAccessToken());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
        assertNotNull(response.getHeader("Set-Cookie"));
    }

    @Test
    void register_shouldThrowConflictWhenEmailExists() {
        RegisterRequest request = RegisterRequest.builder()
                .email("customer@aura.com")
                .password("Password123!")
                .firstName("Alex")
                .lastName("Morgan")
                .build();

        when(userRepository.existsByEmailIgnoreCase("customer@aura.com")).thenReturn(true);

        MockHttpServletResponse response = new MockHttpServletResponse();
        assertThrows(EmailAlreadyExistsException.class, () ->
                authService.register(request, response, "127.0.0.1", "TestAgent")
        );
    }

    @Test
    void login_shouldSucceedWithValidCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("customer@aura.com")
                .password("Password123!")
                .build();

        when(userRepository.findByEmailIgnoreCase("customer@aura.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtProvider.generateAccessToken(any(), any(), any())).thenReturn("valid_jwt");

        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthResponse authResponse = authService.login(request, response, "127.0.0.1", "TestAgent");

        assertNotNull(authResponse);
        assertEquals("valid_jwt", authResponse.getAccessToken());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void login_shouldThrowWhenPasswordIsIncorrect() {
        LoginRequest request = LoginRequest.builder()
                .email("customer@aura.com")
                .password("WrongPassword")
                .build();

        when(userRepository.findByEmailIgnoreCase("customer@aura.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        MockHttpServletResponse response = new MockHttpServletResponse();
        assertThrows(InvalidCredentialsException.class, () ->
                authService.login(request, response, "127.0.0.1", "TestAgent")
        );
    }

    @Test
    void refresh_shouldDetectRevokedTokenAndRevokeAllSessions() {
        RefreshToken revokedToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(sampleUser)
                .tokenHash("somehash")
                .revoked(true)
                .expiresAt(Instant.now().plus(1, ChronoUnit.DAYS))
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(revokedToken));

        MockHttpServletResponse response = new MockHttpServletResponse();
        assertThrows(TokenRefreshException.class, () ->
                authService.refresh("stolen-token-uuid", response, "127.0.0.1", "TestAgent")
        );

        verify(refreshTokenRepository, times(1)).revokeAllActiveTokensByUser(sampleUser);
    }
}
