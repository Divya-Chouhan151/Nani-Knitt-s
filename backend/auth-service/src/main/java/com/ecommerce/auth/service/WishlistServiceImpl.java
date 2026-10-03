package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.WishlistItemRequest;
import com.ecommerce.auth.dto.response.WishlistItemResponse;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.WishlistItem;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private static final int MAX_WISHLIST_ITEMS = 12;

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlist(String email) {
        User user = getUser(email);
        log.debug("Fetching wishlist for user email={}, userId={}", email, user.getId());
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistItemResponse addItem(String email, WishlistItemRequest request) {
        User user = getUser(email);
        String sku = request.getSku() != null ? request.getSku().trim() : "";
        log.info("Wishlist add request: user email={}, userId={}, productId={}, sku={}, title={}, price={}",
                email, user.getId(), request.getProductId(), sku, request.getTitle(), request.getPrice());

        Optional<WishlistItem> existing = Optional.empty();
        if (!sku.isBlank()) {
            existing = wishlistRepository.findByUserIdAndSkuIgnoreCase(user.getId(), sku);
        }
        if (existing.isEmpty() && request.getProductId() != null) {
            existing = wishlistRepository.findByUserIdAndProductId(user.getId(), request.getProductId());
        }

        if (existing.isPresent()) {
            WishlistItem item = existing.get();
            log.info("Item already exists in wishlist (itemId={}), updating details", item.getId());
            item.setPrice(request.getPrice());
            if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
                item.setImageUrl(request.getImageUrl());
            }
            if (request.getTitle() != null && !request.getTitle().isBlank()) {
                item.setTitle(request.getTitle().trim());
            }
            WishlistItem updated = wishlistRepository.saveAndFlush(item);
            return mapToResponse(updated);
        }

        long count = wishlistRepository.countByUserId(user.getId());
        if (count >= MAX_WISHLIST_ITEMS) {
            log.warn("Wishlist item limit reached ({}/{}) for user email={}", count, MAX_WISHLIST_ITEMS, email);
            throw new IllegalStateException("Wishlist cannot contain more than " + MAX_WISHLIST_ITEMS + " items");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .productId(request.getProductId())
                .sku(sku)
                .title(request.getTitle() != null ? request.getTitle().trim() : "")
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .inStock(true)
                .build();

        WishlistItem saved = wishlistRepository.saveAndFlush(item);
        log.info("Successfully persisted new wishlist item id={} for user email={}, totalCount={}",
                saved.getId(), email, count + 1);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void removeItem(String email, UUID itemId) {
        User user = getUser(email);
        log.info("Removing wishlist item: email={}, itemId={}", email, itemId);
        Optional<WishlistItem> item = wishlistRepository.findByIdAndUserId(itemId, user.getId());
        if (item.isEmpty()) {
            item = wishlistRepository.findByUserIdAndProductId(user.getId(), itemId);
        }
        WishlistItem foundItem = item.orElseThrow(() -> new IllegalArgumentException("Item not found in wishlist"));
        wishlistRepository.delete(foundItem);
        log.info("Successfully deleted wishlist item id={} for user email={}", foundItem.getId(), email);
    }

    @Override
    @Transactional
    public void removeItemBySku(String email, String sku) {
        if (sku == null || sku.isBlank()) return;
        User user = getUser(email);
        String trimmed = sku.trim();
        log.info("Removing wishlist items by sku: email={}, sku={}", email, trimmed);
        wishlistRepository.deleteByUserIdAndSku(user.getId(), trimmed);
        wishlistRepository.deleteByUserIdAndSku(user.getId(), trimmed.toUpperCase());
        wishlistRepository.deleteByUserIdAndSku(user.getId(), trimmed.toLowerCase());
        if (trimmed.toUpperCase().startsWith("SKU-")) {
            wishlistRepository.deleteByUserIdAndSku(user.getId(), trimmed.substring(4));
        }
    }

    @Override
    @Transactional
    public void removeItemByProductId(String email, UUID productId) {
        if (productId == null) return;
        User user = getUser(email);
        log.info("Removing wishlist item by productId: email={}, productId={}", email, productId);
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private WishlistItemResponse mapToResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .sku(item.getSku())
                .title(item.getTitle())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .inStock(item.getInStock())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
