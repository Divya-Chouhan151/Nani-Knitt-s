package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.request.CartItemRequest;
import com.ecommerce.cart.dto.response.CartItemResponse;
import com.ecommerce.cart.dto.response.CartSummaryResponse;

import java.util.UUID;

public interface CartService {
    CartSummaryResponse getCart(UUID userId);
    CartItemResponse addItem(UUID userId, CartItemRequest request);
    CartItemResponse updateQuantity(UUID userId, UUID itemId, int quantity);
    void removeItem(UUID userId, UUID itemId);
    void clearCart(UUID userId);
}
