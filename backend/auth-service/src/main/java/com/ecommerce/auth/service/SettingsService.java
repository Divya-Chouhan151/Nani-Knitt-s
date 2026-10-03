package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AccountDeactivationRequest;
import com.ecommerce.auth.dto.response.UserSettingsDto;

public interface SettingsService {
    UserSettingsDto getSettings(String email);
    UserSettingsDto updateSettings(String email, UserSettingsDto dto);
    void requestAccountDeletion(String email, AccountDeactivationRequest request);
    void cancelAccountDeletion(String email);
}
