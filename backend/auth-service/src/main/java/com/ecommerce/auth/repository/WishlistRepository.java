package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, UUID> {
    long countByUserId(UUID userId);
    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<WishlistItem> findByUserIdAndSku(UUID userId, String sku);
    Optional<WishlistItem> findByUserIdAndSkuIgnoreCase(UUID userId, String sku);
    Optional<WishlistItem> findByUserIdAndProductId(UUID userId, UUID productId);
    Optional<WishlistItem> findByIdAndUserId(UUID id, UUID userId);
    void deleteByUserIdAndSku(UUID userId, String sku);
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
}
