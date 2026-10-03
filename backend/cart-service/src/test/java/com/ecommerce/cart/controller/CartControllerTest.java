package com.ecommerce.cart.controller;

import com.ecommerce.cart.dto.request.CartItemRequest;
import com.ecommerce.cart.dto.request.UpdateCartItemRequest;
import com.ecommerce.cart.dto.response.CartItemResponse;
import com.ecommerce.cart.dto.response.CartSummaryResponse;
import com.ecommerce.cart.service.CartService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @Test
    void getCart_shouldReturnCartSummary() throws Exception {
        UUID userId = UUID.randomUUID();
        CartSummaryResponse summary = CartSummaryResponse.builder()
                .items(List.of(CartItemResponse.builder()
                        .id(UUID.randomUUID())
                        .sku("AURA-SKU-1")
                        .title("Wireless Headphones")
                        .price(BigDecimal.valueOf(199.99))
                        .quantity(2)
                        .totalPrice(BigDecimal.valueOf(399.98))
                        .build()))
                .totalQuantity(2)
                .subtotal(BigDecimal.valueOf(399.98))
                .build();

        when(cartService.getCart(eq(userId))).thenReturn(summary);

        mockMvc.perform(get("/api/v1/cart")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuantity").value(2))
                .andExpect(jsonPath("$.items[0].sku").value("AURA-SKU-1"));
    }

    @Test
    void addItem_shouldReturnCreated() throws Exception {
        UUID userId = UUID.randomUUID();
        CartItemRequest request = CartItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("AURA-SKU-1")
                .title("Wireless Headphones")
                .price(BigDecimal.valueOf(199.99))
                .quantity(1)
                .imageUrl("https://example.com/img.jpg")
                .build();

        CartItemResponse response = CartItemResponse.builder()
                .id(UUID.randomUUID())
                .sku("AURA-SKU-1")
                .title("Wireless Headphones")
                .price(BigDecimal.valueOf(199.99))
                .quantity(1)
                .totalPrice(BigDecimal.valueOf(199.99))
                .build();

        when(cartService.addItem(eq(userId), any(CartItemRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("AURA-SKU-1"));
    }

    @Test
    void addItem_shouldFailValidation_whenQuantityIsZeroOrNegative() throws Exception {
        UUID userId = UUID.randomUUID();
        CartItemRequest request = CartItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("AURA-SKU-1")
                .title("Wireless Headphones")
                .price(BigDecimal.valueOf(199.99))
                .quantity(0)
                .build();

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateQuantity_shouldReturnOk() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UpdateCartItemRequest request = new UpdateCartItemRequest(3);

        CartItemResponse response = CartItemResponse.builder()
                .id(itemId)
                .sku("AURA-SKU-1")
                .quantity(3)
                .totalPrice(BigDecimal.valueOf(599.97))
                .build();

        when(cartService.updateQuantity(eq(userId), eq(itemId), eq(3))).thenReturn(response);

        mockMvc.perform(put("/api/v1/cart/items/{itemId}", itemId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(3));
    }

    @Test
    void removeItem_shouldReturnNoContent() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/cart/items/{itemId}", itemId)
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isNoContent());

        verify(cartService).removeItem(eq(userId), eq(itemId));
    }

    @Test
    void clearCart_shouldReturnNoContent() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/cart")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isNoContent());

        verify(cartService).clearCart(eq(userId));
    }
}
