package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.UserVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVerificationRepository extends JpaRepository<UserVerification, UUID> {
    Optional<UserVerification> findByUserIdAndVerificationTypeAndCodeAndConsumedFalse(
            UUID userId, String verificationType, String code);

    Optional<UserVerification> findByTokenAndConsumedFalse(String token);
}
