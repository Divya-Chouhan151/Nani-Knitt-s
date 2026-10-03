package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.LoginRequest;
import com.ecommerce.auth.dto.request.RegisterRequest;
import com.ecommerce.auth.dto.response.AuthResponse;
import com.ecommerce.auth.dto.response.UserResponse;
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
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuditService auditService;

    @Value("${application.security.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response, String ipAddress, String userAgent) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            auditService.logEvent(null, "REGISTER", "FAILED", ipAddress, userAgent, "Email conflict: " + email);
            throw new EmailAlreadyExistsException("An account with email " + email + " already exists");
        }

        Role customerRole = roleRepository.findByName(RoleType.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleType.ROLE_CUSTOMER)
                        .description("Standard shopper")
                        .build()));

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .status("ACTIVE")
                .emailVerified(false)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        User savedUser = userRepository.saveAndFlush(user);

        // Generate tokens
        List<String> roleNames = getRoleNames(savedUser);
        String accessToken = jwtProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail(), roleNames);
        issueAndSetRefreshToken(savedUser, response, ipAddress, userAgent);

        auditService.logEvent(savedUser.getId(), "REGISTER", "SUCCESS", ipAddress, userAgent, "New user registered");

        return buildAuthResponse(savedUser, accessToken, roleNames);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response, String ipAddress, String userAgent) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> {
                    auditService.logEvent(null, "LOGIN", "FAILED", ipAddress, userAgent, "Unknown email: " + email);
                    return new InvalidCredentialsException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditService.logEvent(user.getId(), "LOGIN", "FAILED", ipAddress, userAgent, "Incorrect password");
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            auditService.logEvent(user.getId(), "LOGIN", "BLOCKED", ipAddress, userAgent, "Account status: " + user.getStatus());
            throw new InvalidCredentialsException("Account is inactive or locked");
        }

        List<String> roleNames = getRoleNames(user);
        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getEmail(), roleNames);
        issueAndSetRefreshToken(user, response, ipAddress, userAgent);

        auditService.logEvent(user.getId(), "LOGIN", "SUCCESS", ipAddress, userAgent, "User authenticated successfully");

        return buildAuthResponse(user, accessToken, roleNames);
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshTokenCookie, HttpServletResponse response, String ipAddress, String userAgent) {
        if (refreshTokenCookie == null || refreshTokenCookie.isBlank()) {
            throw new TokenRefreshException("Missing refresh token cookie");
        }

        String tokenHash = hashToken(refreshTokenCookie);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new TokenRefreshException("Invalid refresh token"));

        User user = storedToken.getUser();

        // Check reuse detection
        if (storedToken.getRevoked()) {
            // Compromised token presentation! Revoke all tokens for this user
            refreshTokenRepository.revokeAllActiveTokensByUser(user);
            auditService.logEvent(user.getId(), "TOKEN_REUSE_DETECTED", "ALERT", ipAddress, userAgent,
                    "Revoked token presented. All active sessions invalidated.");
            throw new TokenRefreshException("Suspicious token activity detected. Please log in again.");
        }

        if (storedToken.isExpired()) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            auditService.logEvent(user.getId(), "TOKEN_REFRESH", "EXPIRED", ipAddress, userAgent, "Token expired");
            throw new TokenRefreshException("Refresh token has expired. Please log in again.");
        }

        // Invalidate old token
        storedToken.setRevoked(true);

        // Generate and issue new rotated refresh token
        String newRawToken = UUID.randomUUID().toString();
        String newTokenHash = hashToken(newRawToken);
        storedToken.setReplacedBy(newTokenHash);
        refreshTokenRepository.save(storedToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        setRefreshTokenCookie(response, newRawToken);

        List<String> roleNames = getRoleNames(user);
        String newAccessToken = jwtProvider.generateAccessToken(user.getId(), user.getEmail(), roleNames);

        auditService.logEvent(user.getId(), "TOKEN_REFRESH", "SUCCESS", ipAddress, userAgent, "Rotated refresh token");

        return buildAuthResponse(user, newAccessToken, roleNames);
    }

    @Override
    @Transactional
    public void logout(String refreshTokenCookie, HttpServletResponse response, String ipAddress, String userAgent) {
        if (refreshTokenCookie != null && !refreshTokenCookie.isBlank()) {
            String tokenHash = hashToken(refreshTokenCookie);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
                auditService.logEvent(token.getUser().getId(), "LOGOUT", "SUCCESS", ipAddress, userAgent, "User logged out");
            });
        }

        clearRefreshTokenCookie(response);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        return toUserResponse(user, getRoleNames(user));
    }

    private void issueAndSetRefreshToken(User user, HttpServletResponse response, String ipAddress, String userAgent) {
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        refreshTokenRepository.save(refreshToken);
        setRefreshTokenCookie(response, rawToken);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String rawToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, rawToken)
                .httpOnly(true)
                .secure(false) // Set to true in production over HTTPS
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(refreshTokenExpirationMs / 1000)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    private List<String> getRoleNames(User user) {
        return user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, List<String> roleNames) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtProvider.getAccessTokenExpirationSeconds())
                .user(toUserResponse(user, roleNames))
                .build();
    }

    private UserResponse toUserResponse(User user, List<String> roleNames) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(new HashSet<>(roleNames))
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .phoneNumber(user.getPhoneNumber())
                .optionalPhoneNumber(user.getOptionalPhoneNumber())
                .phoneVerified(user.getPhoneVerified())
                .dob(user.getDob())
                .gender(user.getGender())
                .avatarUrl(user.getAvatarUrl())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
