package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.LoginRequest;
import com.ecommerce.auth.dto.request.RegisterRequest;
import com.ecommerce.auth.dto.response.AuthResponse;
import com.ecommerce.auth.dto.response.UserResponse;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request, HttpServletResponse response, String ipAddress, String userAgent);
    AuthResponse login(LoginRequest request, HttpServletResponse response, String ipAddress, String userAgent);
    AuthResponse refresh(String refreshTokenCookie, HttpServletResponse response, String ipAddress, String userAgent);
    void logout(String refreshTokenCookie, HttpServletResponse response, String ipAddress, String userAgent);
    UserResponse getCurrentUser(String email);
}
