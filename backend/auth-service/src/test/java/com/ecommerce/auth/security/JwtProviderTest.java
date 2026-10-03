package com.ecommerce.auth.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtProviderTest {

    private JwtProvider jwtProvider;
    private final String secretKey = "dGhpcy1pcy1hLXZlcnktc2VjdXJlLTI1Ni1iaXQtc2VjcmV0LWtleS1mb3ItZGV2ZWxvcG1lbnQtYXVyYS1hdXRoLXNlcnZpY2U=";

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(secretKey, 900000);
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        UUID userId = UUID.randomUUID();
        String email = "customer@aura.com";
        List<String> roles = List.of("ROLE_CUSTOMER");

        String token = jwtProvider.generateAccessToken(userId, email, roles);

        assertNotNull(token);
        assertTrue(jwtProvider.validateToken(token));

        Claims claims = jwtProvider.getClaimsFromToken(token);
        assertEquals(userId.toString(), claims.getSubject());
        assertEquals(email, claims.get("email", String.class));
        assertEquals(roles, claims.get("roles", List.class));
    }

    @Test
    void shouldRejectTamperedToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtProvider.generateAccessToken(userId, "test@aura.com", List.of("ROLE_CUSTOMER"));
        String tamperedToken = token + "corrupted";

        assertFalse(jwtProvider.validateToken(tamperedToken));
    }

    @Test
    void shouldVerifyBcryptAdminHash() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
        assertTrue(encoder.matches("admin", "$2a$12$5cwYprsoHkERL454fjtsNei6vkRo5iSOGRmKHMzr/aRHtWBxjxugu"));
    }
}
