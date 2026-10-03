package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, UUID> {
    List<ReturnRequest> findByUserIdOrderByRequestedAtDesc(UUID userId);
    Optional<ReturnRequest> findByOrderId(UUID orderId);
}
