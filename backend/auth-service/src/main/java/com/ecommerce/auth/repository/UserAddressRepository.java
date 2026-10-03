package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, UUID> {
    List<UserAddress> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(UUID userId);
    Optional<UserAddress> findByIdAndUserIdAndDeletedFalse(UUID id, UUID userId);

    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefaultShipping = false WHERE a.user.id = :userId")
    void resetDefaultShipping(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefaultBilling = false WHERE a.user.id = :userId")
    void resetDefaultBilling(@Param("userId") UUID userId);
}
