package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<CartItem, UUID> {
    long countByUserId(UUID userId);
    List<CartItem> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<CartItem> findByUserIdAndSku(UUID userId, String sku);
    Optional<CartItem> findByIdAndUserId(UUID id, UUID userId);
    void deleteByUserId(UUID userId);
}
