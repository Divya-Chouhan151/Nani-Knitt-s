package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status, Pageable pageable);
    Page<Order> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(UUID userId, Instant start, Instant end, Pageable pageable);
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    Optional<Order> findByOrderNumberAndUserId(String orderNumber, UUID userId);
}
