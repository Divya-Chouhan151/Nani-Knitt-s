package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.UpdateProfileRequest;
import com.ecommerce.auth.dto.response.UserResponse;
import com.ecommerce.auth.entity.Role;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.UserVerification;
import com.ecommerce.auth.exception.EmailAlreadyExistsException;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.repository.UserVerificationRepository;
import com.ecommerce.auth.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final UserVerificationRepository verificationRepository;
    private final StorageService storageService;
    private final AuditService auditService;

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUser(email);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
            user.setPhoneVerified(true);
        }
        if (request.getOptionalPhoneNumber() != null) {
            String optPhone = request.getOptionalPhoneNumber().trim();
            user.setOptionalPhoneNumber(optPhone.isEmpty() ? null : optPhone);
        } else {
            user.setOptionalPhoneNumber(null);
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        User saved = userRepository.save(user);
        auditService.logEvent(user.getId(), "PROFILE_UPDATE", "SUCCESS", null, null, "Updated profile personal details");
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public String uploadAvatar(String email, MultipartFile file) {
        User user = getUser(email);
        if (user.getAvatarUrl() != null) {
            storageService.delete(user.getAvatarUrl());
        }

        String avatarUrl = storageService.store(file, "avatars");
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        auditService.logEvent(user.getId(), "AVATAR_UPLOAD", "SUCCESS", null, null, "Uploaded new avatar: " + avatarUrl);
        return avatarUrl;
    }

    @Override
    @Transactional
    public void initiateEmailChange(String email, String newEmail) {
        User user = getUser(email);
        if (userRepository.existsByEmailIgnoreCase(newEmail.trim())) {
            throw new EmailAlreadyExistsException("Email already in use: " + newEmail);
        }

        String token = UUID.randomUUID().toString();
        UserVerification verification = UserVerification.builder()
                .user(user)
                .verificationType("EMAIL_CHANGE")
                .targetValue(newEmail.trim())
                .code(token.substring(0, 6).toUpperCase())
                .token(token)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .consumed(false)
                .build();

        verificationRepository.save(verification);
        log.info("SIMULATED EMAIL DISPATCH: Verification link sent to {}: token={}", newEmail, token);
        auditService.logEvent(user.getId(), "EMAIL_CHANGE_INITIATED", "SUCCESS", null, null, "Initiated email change to " + newEmail);
    }

    @Override
    @Transactional
    public UserResponse confirmEmailChange(String token) {
        UserVerification verification = verificationRepository.findByTokenAndConsumedFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (verification.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = verification.getUser();
        user.setEmail(verification.getTargetValue());
        user.setEmailVerified(true);
        verification.setConsumed(true);

        verificationRepository.save(verification);
        User saved = userRepository.save(user);

        auditService.logEvent(user.getId(), "EMAIL_CHANGE_CONFIRMED", "SUCCESS", null, null, "Confirmed email change to " + user.getEmail());
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public void initiatePhoneChange(String email, String newPhone) {
        User user = getUser(email);
        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        UserVerification verification = UserVerification.builder()
                .user(user)
                .verificationType("PHONE_CHANGE")
                .targetValue(newPhone.trim())
                .code(otp)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .consumed(false)
                .build();

        verificationRepository.save(verification);
        log.info("SIMULATED SMS OTP DISPATCH: OTP sent to {}: code={}", newPhone, otp);
        auditService.logEvent(user.getId(), "PHONE_CHANGE_INITIATED", "SUCCESS", null, null, "Initiated phone change to " + newPhone);
    }

    @Override
    @Transactional
    public UserResponse confirmPhoneChange(String email, String code) {
        User user = getUser(email);
        UserVerification verification = verificationRepository
                .findByUserIdAndVerificationTypeAndCodeAndConsumedFalse(user.getId(), "PHONE_CHANGE", code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (verification.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setPhoneNumber(verification.getTargetValue());
        user.setPhoneVerified(true);
        verification.setConsumed(true);

        verificationRepository.save(verification);
        User saved = userRepository.save(user);

        auditService.logEvent(user.getId(), "PHONE_CHANGE_CONFIRMED", "SUCCESS", null, null, "Confirmed phone change to " + user.getPhoneNumber());
        return mapToUserResponse(saved);
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()))
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
