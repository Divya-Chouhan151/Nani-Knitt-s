package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.request.CartItemRequest;
import com.ecommerce.cart.dto.response.CartItemResponse;
import com.ecommerce.cart.dto.response.CartSummaryResponse;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.exception.CartItemNotFoundException;
import com.ecommerce.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private static final int MAX_CART_ITEMS = 12;

    private final CartRepository cartRepository;

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCart(UUID userId) {
        List<CartItem> items = cartRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<CartItemResponse> responses = items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        int totalQty = responses.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal subtotal = responses.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartSummaryResponse.builder()
                .items(responses)
                .totalQuantity(totalQty)
                .subtotal(subtotal)
                .build();
    }

    @Override
    @Transactional
    public CartItemResponse addItem(UUID userId, CartItemRequest request) {
        Optional<CartItem> existing = cartRepository.findByUserIdAndSku(userId, request.getSku());
        List<CartItem> currentItems = cartRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (currentItems == null) {
            currentItems = existing.map(List::of).orElse(List.of());
        }

        int currentTotalQty = currentItems.stream().mapToInt(CartItem::getQuantity).sum();
        int requestedQty = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;

        if (existing.isPresent()) {
            if (currentTotalQty + requestedQty > MAX_CART_ITEMS) {
                throw new IllegalStateException("Cart cannot contain more than " + MAX_CART_ITEMS + " items");
            }
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + requestedQty);
            item.setPrice(request.getPrice()); // update to latest price
            return mapToResponse(cartRepository.save(item));
        } else {
            if (currentItems.size() >= MAX_CART_ITEMS || currentTotalQty + requestedQty > MAX_CART_ITEMS) {
                throw new IllegalStateException("Cart cannot contain more than " + MAX_CART_ITEMS + " items");
            }
            CartItem item = CartItem.builder()
                    .userId(userId)
                    .productId(request.getProductId())
                    .sku(request.getSku())
                    .title(request.getTitle())
                    .price(request.getPrice())
                    .quantity(requestedQty)
                    .imageUrl(request.getImageUrl())
                    .build();
            return mapToResponse(cartRepository.save(item));
        }
    }

    @Override
    @Transactional
    public CartItemResponse updateQuantity(UUID userId, UUID itemId, int quantity) {
        List<CartItem> currentItems = cartRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (currentItems == null) {
            currentItems = List.of();
        }
        CartItem item = currentItems.stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseGet(() -> cartRepository.findByIdAndUserId(itemId, userId)
                        .orElseThrow(() -> new CartItemNotFoundException("Cart item not found: " + itemId)));

        int otherItemsQty = currentItems.stream()
                .filter(i -> !i.getId().equals(itemId))
                .mapToInt(CartItem::getQuantity)
                .sum();

        if (otherItemsQty + quantity > MAX_CART_ITEMS) {
            throw new IllegalStateException("Cart cannot contain more than " + MAX_CART_ITEMS + " items");
        }

        item.setQuantity(quantity);
        CartItem saved = cartRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void removeItem(UUID userId, UUID itemId) {
        CartItem item = cartRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found: " + itemId));
        cartRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(UUID userId) {
        cartRepository.deleteByUserId(userId);
    }

    private CartItemResponse mapToResponse(CartItem item) {
        BigDecimal total = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .sku(item.getSku())
                .title(item.getTitle())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .totalPrice(total)
                .imageUrl(item.getImageUrl())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
