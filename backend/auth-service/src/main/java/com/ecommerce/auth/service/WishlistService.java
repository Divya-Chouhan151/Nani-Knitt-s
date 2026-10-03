package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.WishlistItemRequest;
import com.ecommerce.auth.dto.response.WishlistItemResponse;

import java.util.List;
import java.util.UUID;

public interface WishlistService {
    List<WishlistItemResponse> getWishlist(String email);
    WishlistItemResponse addItem(String email, WishlistItemRequest request);
    void removeItem(String email, UUID itemId);
    void removeItemBySku(String email, String sku);
    void removeItemByProductId(String email, UUID productId);
}
