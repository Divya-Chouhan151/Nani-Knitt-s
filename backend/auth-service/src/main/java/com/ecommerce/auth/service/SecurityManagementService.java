package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.ChangePasswordRequest;
import com.ecommerce.auth.dto.response.SecurityAuditLogDto;
import com.ecommerce.auth.dto.response.SessionResponse;
import com.ecommerce.auth.dto.response.TwoFactorSetupResponse;

import java.util.List;
import java.util.UUID;

public interface SecurityManagementService {
    void changePassword(String email, ChangePasswordRequest request);
    List<SessionResponse> getActiveSessions(String email);
    List<SessionResponse> getActiveSessions(String email, String refreshTokenCookie, String ipAddress, String userAgent);
    void revokeSession(String email, UUID sessionId);
    void revokeAllOtherSessions(String email, String refreshTokenCookie, String ipAddress, String userAgent);
    void revokeAllSessions(String email);
    TwoFactorSetupResponse initiate2FaSetup(String email);
    void confirm2Fa(String email, String code);
    void disable2Fa(String email, String password);
    List<SecurityAuditLogDto> getAuditLogs(String email);
}
