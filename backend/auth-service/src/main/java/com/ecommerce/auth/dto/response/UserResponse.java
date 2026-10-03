package com.ecommerce.auth.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
    private String status;
    private Boolean emailVerified;
    private String phoneNumber;
    private String optionalPhoneNumber;
    private Boolean phoneVerified;
    private java.time.LocalDate dob;
    private String gender;
    private String avatarUrl;
    private Boolean twoFactorEnabled;
    private Instant createdAt;
}
