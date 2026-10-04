package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.ChangePasswordRequest;
import com.ecommerce.auth.dto.request.TwoFactorVerifyRequest;
import com.ecommerce.auth.dto.response.SecurityAuditLogDto;
import com.ecommerce.auth.dto.response.SessionResponse;
import com.ecommerce.auth.dto.response.TwoFactorSetupResponse;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.SecurityManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/security")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SecurityController {

    private final SecurityManagementService securityService;

    @PostMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = getAuthenticatedEmail(principal);
        securityService.changePassword(email, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please log in with your new credentials on other devices."));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getSessions(
            Principal principal,
            @CookieValue(name = "refreshToken", required = false) String refreshTokenCookie,
            jakarta.servlet.http.HttpServletRequest request) {
        String email = getAuthenticatedEmail(principal);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        if (refreshTokenCookie != null || (userAgent != null && !userAgent.isBlank())) {
            String ip = request != null ? request.getRemoteAddr() : null;
            return ResponseEntity.ok(securityService.getActiveSessions(email, refreshTokenCookie, ip, userAgent));
        }
        return ResponseEntity.ok(securityService.getActiveSessions(email));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> revokeSession(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        securityService.revokeSession(email, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup2Fa(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(securityService.initiate2FaSetup(email));
    }

    @PostMapping("/2fa/confirm")
    public ResponseEntity<Map<String, String>> confirm2Fa(
            Principal principal,
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        String email = getAuthenticatedEmail(principal);
        securityService.confirm2Fa(email, request.getCode());
        return ResponseEntity.ok(Map.of("message", "Two-factor authentication enabled successfully."));
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<Map<String, String>> disable2Fa(
            Principal principal,
            @RequestBody Map<String, String> body) {
        String email = getAuthenticatedEmail(principal);
        String password = body.getOrDefault("password", "");
        securityService.disable2Fa(email, password);
        return ResponseEntity.ok(Map.of("message", "Two-factor authentication disabled."));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<SecurityAuditLogDto>> getAuditLogs(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(securityService.getAuditLogs(email));
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
