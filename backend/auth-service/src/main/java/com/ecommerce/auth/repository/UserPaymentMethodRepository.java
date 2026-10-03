package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.UserPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPaymentMethodRepository extends JpaRepository<UserPaymentMethod, UUID> {

    List<UserPaymentMethod> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(UUID userId);

    Optional<UserPaymentMethod> findByIdAndUserIdAndDeletedFalse(UUID id, UUID userId);

    boolean existsByUserIdAndVpaIgnoreCaseAndDeletedFalse(UUID userId, String vpa);

    @Modifying
    @Query("UPDATE UserPaymentMethod p SET p.isDefault = false WHERE p.user.id = :userId AND p.deleted = false")
    void resetDefaultPaymentMethod(@Param("userId") UUID userId);
}
