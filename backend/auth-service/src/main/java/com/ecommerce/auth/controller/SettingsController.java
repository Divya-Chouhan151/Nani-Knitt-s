package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.AccountDeactivationRequest;
import com.ecommerce.auth.dto.response.UserSettingsDto;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<UserSettingsDto> getSettings(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(settingsService.getSettings(email));
    }

    @PutMapping
    public ResponseEntity<UserSettingsDto> updateSettings(
            Principal principal,
            @RequestBody UserSettingsDto dto) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(settingsService.updateSettings(email, dto));
    }

    @PostMapping("/deactivate")
    public ResponseEntity<Map<String, String>> requestAccountDeletion(
            Principal principal,
            @Valid @RequestBody AccountDeactivationRequest request) {
        String email = getAuthenticatedEmail(principal);
        settingsService.requestAccountDeletion(email, request);
        return ResponseEntity.ok(Map.of("message", "Your account has been marked for deletion. It will be permanently purged in 30 days unless you sign back in."));
    }

    @PostMapping("/reactivate")
    public ResponseEntity<Map<String, String>> cancelAccountDeletion(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        settingsService.cancelAccountDeletion(email);
        return ResponseEntity.ok(Map.of("message", "Account deletion request has been cancelled. Your account is active."));
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
