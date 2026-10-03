package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AccountDeactivationRequest;
import com.ecommerce.auth.dto.response.UserSettingsDto;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.UserSettings;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    @Transactional
    public UserSettingsDto getSettings(String email) {
        User user = getUser(email);
        UserSettings settings = settingsRepository.findById(user.getId())
                .orElseGet(() -> settingsRepository.save(UserSettings.builder()
                        .user(user)
                        .userId(user.getId())
                        .emailNotifications(true)
                        .smsNotifications(true)
                        .pushNotifications(true)
                        .orderUpdates(true)
                        .promotionalEmails(false)
                        .language("en")
                        .currency("INR")
                        .marketingConsent(false)
                        .dataSharingConsent(false)
                        .build()));

        return mapToDto(settings, user);
    }

    @Override
    @Transactional
    public UserSettingsDto updateSettings(String email, UserSettingsDto dto) {
        User user = getUser(email);
        UserSettings settings = settingsRepository.findById(user.getId())
                .orElseGet(() -> UserSettings.builder().user(user).userId(user.getId()).build());

        if (dto.getEmailNotifications() != null) settings.setEmailNotifications(dto.getEmailNotifications());
        if (dto.getSmsNotifications() != null) settings.setSmsNotifications(dto.getSmsNotifications());
        if (dto.getPushNotifications() != null) settings.setPushNotifications(dto.getPushNotifications());
        if (dto.getOrderUpdates() != null) settings.setOrderUpdates(dto.getOrderUpdates());
        if (dto.getPromotionalEmails() != null) settings.setPromotionalEmails(dto.getPromotionalEmails());
        if (dto.getLanguage() != null) settings.setLanguage(dto.getLanguage());
        if (dto.getCurrency() != null) settings.setCurrency(dto.getCurrency());
        if (dto.getMarketingConsent() != null) settings.setMarketingConsent(dto.getMarketingConsent());
        if (dto.getDataSharingConsent() != null) settings.setDataSharingConsent(dto.getDataSharingConsent());

        UserSettings saved = settingsRepository.save(settings);
        auditService.logEvent(user.getId(), "SETTINGS_UPDATE", "SUCCESS", null, null, "Updated user settings");
        return mapToDto(saved, user);
    }

    @Override
    @Transactional
    public void requestAccountDeletion(String email, AccountDeactivationRequest request) {
        User user = getUser(email);

        if (!"DELETE".equals(request.getConfirmation())) {
            throw new IllegalArgumentException("Confirmation phrase must be 'DELETE'");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Password does not match");
        }

        Instant now = Instant.now();
        Instant purgeAt = now.plus(30, ChronoUnit.DAYS);

        user.setStatus("PENDING_DELETION");
        user.setDeletionRequestedAt(now);
        user.setScheduledPurgeAt(purgeAt);
        userRepository.save(user);

        // Immediately revoke all sessions
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId());
        activeTokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(activeTokens);

        auditService.logEvent(user.getId(), "ACCOUNT_DELETION_REQUESTED", "SUCCESS", null, null,
                "Account deletion requested with 30-day grace period until " + purgeAt);
    }

    @Override
    @Transactional
    public void cancelAccountDeletion(String email) {
        User user = getUser(email);
        user.setStatus("ACTIVE");
        user.setDeletionRequestedAt(null);
        user.setScheduledPurgeAt(null);
        userRepository.save(user);

        auditService.logEvent(user.getId(), "ACCOUNT_DELETION_CANCELLED", "SUCCESS", null, null, "Account deletion cancelled");
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private UserSettingsDto mapToDto(UserSettings s, User user) {
        return UserSettingsDto.builder()
                .emailNotifications(s.getEmailNotifications())
                .smsNotifications(s.getSmsNotifications())
                .pushNotifications(s.getPushNotifications())
                .orderUpdates(s.getOrderUpdates())
                .promotionalEmails(s.getPromotionalEmails())
                .language(s.getLanguage())
                .currency(s.getCurrency())
                .marketingConsent(s.getMarketingConsent())
                .dataSharingConsent(s.getDataSharingConsent())
                .scheduledPurgeAt(user.getScheduledPurgeAt())
                .deletionRequestedAt(user.getDeletionRequestedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
