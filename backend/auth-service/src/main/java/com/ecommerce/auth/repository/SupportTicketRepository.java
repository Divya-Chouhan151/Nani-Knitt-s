package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<SupportTicket> findByIdAndUserId(UUID id, UUID userId);
    Optional<SupportTicket> findByTicketNumberAndUserId(String ticketNumber, UUID userId);
}
