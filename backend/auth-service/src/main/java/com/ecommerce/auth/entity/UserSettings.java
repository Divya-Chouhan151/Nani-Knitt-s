package com.ecommerce.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Builder.Default
    @Column(name = "sms_notifications", nullable = false)
    private Boolean smsNotifications = true;

    @Builder.Default
    @Column(name = "push_notifications", nullable = false)
    private Boolean pushNotifications = true;

    @Builder.Default
    @Column(name = "order_updates", nullable = false)
    private Boolean orderUpdates = true;

    @Builder.Default
    @Column(name = "promotional_emails", nullable = false)
    private Boolean promotionalEmails = false;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String language = "en";

    @Builder.Default
    @Column(nullable = false, length = 5)
    private String currency = "INR";

    @Builder.Default
    @Column(name = "marketing_consent", nullable = false)
    private Boolean marketingConsent = false;

    @Builder.Default
    @Column(name = "data_sharing_consent", nullable = false)
    private Boolean dataSharingConsent = false;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
