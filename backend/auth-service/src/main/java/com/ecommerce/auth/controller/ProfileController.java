package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.*;
import com.ecommerce.auth.dto.response.UserResponse;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(profileService.updateProfile(email, request));
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        String email = getAuthenticatedEmail(principal);
        String url = profileService.uploadAvatar(email, file);
        return ResponseEntity.ok(Map.of("avatarUrl", url));
    }

    @PostMapping("/email/initiate")
    public ResponseEntity<Map<String, String>> initiateEmailChange(
            Principal principal,
            @Valid @RequestBody InitiateEmailChangeRequest request) {
        String email = getAuthenticatedEmail(principal);
        profileService.initiateEmailChange(email, request.getNewEmail());
        return ResponseEntity.ok(Map.of("message", "Verification email sent to " + request.getNewEmail()));
    }

    @PostMapping("/email/confirm")
    public ResponseEntity<UserResponse> confirmEmailChange(
            @Valid @RequestBody ConfirmEmailChangeRequest request) {
        return ResponseEntity.ok(profileService.confirmEmailChange(request.getToken()));
    }

    @PostMapping("/phone/initiate")
    public ResponseEntity<Map<String, String>> initiatePhoneChange(
            Principal principal,
            @Valid @RequestBody InitiatePhoneChangeRequest request) {
        String email = getAuthenticatedEmail(principal);
        profileService.initiatePhoneChange(email, request.getNewPhone());
        return ResponseEntity.ok(Map.of("message", "SMS verification code sent to " + request.getNewPhone()));
    }

    @PostMapping("/phone/confirm")
    public ResponseEntity<UserResponse> confirmPhoneChange(
            Principal principal,
            @Valid @RequestBody ConfirmPhoneChangeRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(profileService.confirmPhoneChange(email, request.getCode()));
    }

    private String getAuthenticatedEmail(Principal principal) {
        if (principal != null) {
            return principal.getName();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        throw new InvalidCredentialsException("Authentication required");
    }
}
