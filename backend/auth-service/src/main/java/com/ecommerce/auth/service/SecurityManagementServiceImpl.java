package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.ChangePasswordRequest;
import com.ecommerce.auth.dto.response.SecurityAuditLogDto;
import com.ecommerce.auth.dto.response.SessionResponse;
import com.ecommerce.auth.dto.response.TwoFactorSetupResponse;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.entity.SecurityAuditLog;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import com.ecommerce.auth.repository.SecurityAuditLogRepository;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.security.TotpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecurityManagementServiceImpl implements SecurityManagementService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final SecurityAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            auditService.logEvent(user.getId(), "PASSWORD_CHANGE_ATTEMPT", "FAILED", null, null, "Incorrect current password");
            throw new InvalidCredentialsException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate all other active sessions for security
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId());
        activeTokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(activeTokens);

        auditService.logEvent(user.getId(), "PASSWORD_CHANGE", "SUCCESS", null, null, "Password successfully updated. All sessions revoked.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(String email) {
        User user = getUser(email);
        List<RefreshToken> tokens = refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId());

        Instant now = Instant.now();
        return tokens.stream()
                .filter(t -> t.getExpiresAt().isAfter(now))
                .map(t -> SessionResponse.builder()
                        .id(t.getId())
                        .ipAddress(t.getIpAddress() != null ? t.getIpAddress() : "127.0.0.1")
                        .userAgent(t.getUserAgent() != null ? t.getUserAgent() : "Unknown Browser")
                        .createdAt(t.getCreatedAt())
                        .expiresAt(t.getExpiresAt())
                        .isCurrent(false)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void revokeSession(String email, UUID sessionId) {
        User user = getUser(email);
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        auditService.logEvent(user.getId(), "SESSION_REVOKE", "SUCCESS", null, null, "Revoked session: " + sessionId);
    }

    @Override
    @Transactional
    public TwoFactorSetupResponse initiate2FaSetup(String email) {
        User user = getUser(email);
        String secret = TotpUtil.generateSecret();
        List<String> backupCodes = TotpUtil.generateBackupCodes(8);

        user.setTwoFactorSecret(secret);
        user.setTwoFactorBackupCodes(String.join(",", backupCodes));
        userRepository.save(user);

        String uri = TotpUtil.getOtpAuthUri(user.getEmail(), secret);
        auditService.logEvent(user.getId(), "2FA_SETUP_INITIATED", "SUCCESS", null, null, "2FA setup initiated");

        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .otpAuthUri(uri)
                .backupCodes(backupCodes)
                .build();
    }

    @Override
    @Transactional
    public void confirm2Fa(String email, String code) {
        User user = getUser(email);
        if (user.getTwoFactorSecret() == null) {
            throw new IllegalArgumentException("2FA setup was not initiated");
        }

        boolean valid = TotpUtil.verifyCode(user.getTwoFactorSecret(), code.trim());
        if (!valid) {
            auditService.logEvent(user.getId(), "2FA_CONFIRM_ATTEMPT", "FAILED", null, null, "Invalid 6-digit TOTP code");
            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        auditService.logEvent(user.getId(), "2FA_ENABLED", "SUCCESS", null, null, "Two-factor authentication enabled");
    }

    @Override
    @Transactional
    public void disable2Fa(String email, String password) {
        User user = getUser(email);
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            auditService.logEvent(user.getId(), "2FA_DISABLE_ATTEMPT", "FAILED", null, null, "Incorrect password when disabling 2FA");
            throw new InvalidCredentialsException("Incorrect password");
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorBackupCodes(null);
        userRepository.save(user);

        auditService.logEvent(user.getId(), "2FA_DISABLED", "SUCCESS", null, null, "Two-factor authentication disabled");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SecurityAuditLogDto> getAuditLogs(String email) {
        User user = getUser(email);
        List<SecurityAuditLog> logs = auditLogRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());

        return logs.stream()
                .map(l -> SecurityAuditLogDto.builder()
                        .id(l.getId())
                        .eventType(l.getEventType())
                        .status(l.getStatus())
                        .ipAddress(l.getIpAddress())
                        .userAgent(l.getUserAgent())
                        .details(l.getDetails())
                        .createdAt(l.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }
}
