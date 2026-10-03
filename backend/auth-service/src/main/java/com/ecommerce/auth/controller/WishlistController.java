package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.WishlistItemRequest;
import com.ecommerce.auth.dto.response.WishlistItemResponse;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        log.debug("GET /api/v1/profile/wishlist for email={}", email);
        return ResponseEntity.ok(wishlistService.getWishlist(email));
    }

    @PostMapping
    public ResponseEntity<WishlistItemResponse> addItem(
            Principal principal,
            @Valid @RequestBody WishlistItemRequest request) {
        String email = getAuthenticatedEmail(principal);
        log.info("POST /api/v1/profile/wishlist: email={}, productId={}, sku={}, title={}",
                email, request.getProductId(), request.getSku(), request.getTitle());
        WishlistItemResponse response = wishlistService.addItem(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(
            Principal principal,
            @PathVariable("id") String idStr) {
        String email = getAuthenticatedEmail(principal);
        UUID id;
        try {
            id = UUID.fromString(idStr.trim());
        } catch (Exception e) {
            id = UUID.nameUUIDFromBytes(idStr.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
        wishlistService.removeItem(email, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sku/{sku}")
    public ResponseEntity<Void> removeItemBySku(
            Principal principal,
            @PathVariable("sku") String sku) {
        String email = getAuthenticatedEmail(principal);
        wishlistService.removeItemBySku(email, sku);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> removeItemByProductId(
            Principal principal,
            @PathVariable("productId") String productIdStr) {
        String email = getAuthenticatedEmail(principal);
        UUID productId;
        try {
            productId = UUID.fromString(productIdStr.trim());
        } catch (Exception e) {
            productId = UUID.nameUUIDFromBytes(productIdStr.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
        wishlistService.removeItemByProductId(email, productId);
        return ResponseEntity.noContent().build();
    }

    private String getAuthenticatedEmail(Principal principal) {
        if (principal != null) {
            return principal.getName();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        throw new InvalidCredentialsException("Authentication required");
    }
}
