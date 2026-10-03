package com.ecommerce.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDto {
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private Boolean orderUpdates;
    private Boolean promotionalEmails;
    private String language;
    private String currency;
    private Boolean marketingConsent;
    private Boolean dataSharingConsent;
    private Instant scheduledPurgeAt;
    private Instant deletionRequestedAt;
    private Instant updatedAt;
}
