package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.request.CartItemRequest;
import com.ecommerce.cart.dto.response.CartItemResponse;
import com.ecommerce.cart.dto.response.CartSummaryResponse;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void addItem_whenItemDoesNotExist_shouldCreateNewItem() {
        CartItemRequest request = CartItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("SKU-100")
                .title("Aura Watch")
                .price(BigDecimal.valueOf(150.00))
                .quantity(2)
                .build();

        when(cartRepository.findByUserIdAndSku(userId, "SKU-100")).thenReturn(Optional.empty());
        when(cartRepository.save(any(CartItem.class))).thenAnswer(i -> {
            CartItem c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CartItemResponse response = cartService.addItem(userId, request);

        assertThat(response.getSku()).isEqualTo("SKU-100");
        assertThat(response.getQuantity()).isEqualTo(2);
        assertThat(response.getTotalPrice()).isEqualByComparingTo("300.00");
    }

    @Test
    void addItem_whenItemAlreadyExists_shouldIncrementQuantity() {
        CartItem existing = CartItem.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .sku("SKU-100")
                .title("Aura Watch")
                .price(BigDecimal.valueOf(150.00))
                .quantity(1)
                .build();

        CartItemRequest request = CartItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("SKU-100")
                .title("Aura Watch")
                .price(BigDecimal.valueOf(150.00))
                .quantity(2)
                .build();

        when(cartRepository.findByUserIdAndSku(userId, "SKU-100")).thenReturn(Optional.of(existing));
        when(cartRepository.save(any(CartItem.class))).thenAnswer(i -> i.getArgument(0));

        CartItemResponse response = cartService.addItem(userId, request);

        assertThat(response.getQuantity()).isEqualTo(3);
        assertThat(response.getTotalPrice()).isEqualByComparingTo("450.00");
    }

    @Test
    void getCart_shouldCalculateCorrectSummary() {
        CartItem item1 = CartItem.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .sku("SKU-1")
                .price(BigDecimal.valueOf(50.00))
                .quantity(2)
                .build();
        CartItem item2 = CartItem.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .sku("SKU-2")
                .price(BigDecimal.valueOf(100.00))
                .quantity(1)
                .build();

        when(cartRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(item1, item2));

        CartSummaryResponse summary = cartService.getCart(userId);

        assertThat(summary.getTotalQuantity()).isEqualTo(3);
        assertThat(summary.getSubtotal()).isEqualByComparingTo("200.00");
    }

    @Test
    void addItem_whenExceedsMax12Items_shouldThrowException() {
        CartItemRequest request = CartItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("SKU-OVERFLOW")
                .title("Aura Desk")
                .price(BigDecimal.valueOf(500.00))
                .quantity(13)
                .build();

        when(cartRepository.findByUserIdAndSku(userId, "SKU-OVERFLOW")).thenReturn(Optional.empty());

        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class, () -> {
            cartService.addItem(userId, request);
        });
    }
}
