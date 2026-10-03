package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.UpdateProfileRequest;
import com.ecommerce.auth.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    String uploadAvatar(String email, MultipartFile file);
    void initiateEmailChange(String email, String newEmail);
    UserResponse confirmEmailChange(String token);
    void initiatePhoneChange(String email, String newPhone);
    UserResponse confirmPhoneChange(String email, String code);
}
