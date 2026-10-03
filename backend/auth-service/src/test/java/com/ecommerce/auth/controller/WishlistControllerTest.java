package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.WishlistItemRequest;
import com.ecommerce.auth.dto.response.WishlistItemResponse;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.WishlistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
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

@WebMvcTest(WishlistController.class)
@AutoConfigureMockMvc(addFilters = false)
class WishlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WishlistService wishlistService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void getWishlist_shouldReturnItems() throws Exception {
        WishlistItemResponse item = WishlistItemResponse.builder()
                .id(UUID.randomUUID())
                .sku("SKU-1")
                .title("Aura Watch")
                .price(BigDecimal.valueOf(199.99))
                .inStock(true)
                .build();

        when(wishlistService.getWishlist(eq("user@aura.com"))).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/profile/wishlist")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("SKU-1"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void addToWishlist_shouldReturnCreated() throws Exception {
        WishlistItemRequest request = WishlistItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("SKU-1")
                .title("Aura Watch")
                .price(BigDecimal.valueOf(199.99))
                .build();

        WishlistItemResponse item = WishlistItemResponse.builder()
                .id(UUID.randomUUID())
                .sku("SKU-1")
                .title("Aura Watch")
                .price(BigDecimal.valueOf(199.99))
                .inStock(true)
                .build();

        when(wishlistService.addItem(eq("user@aura.com"), any(WishlistItemRequest.class))).thenReturn(item);

        mockMvc.perform(post("/api/v1/profile/wishlist")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-1"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void removeFromWishlist_shouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/profile/wishlist/{id}", id)
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isNoContent());

        verify(wishlistService).removeItem(eq("user@aura.com"), eq(id));
    }
}
