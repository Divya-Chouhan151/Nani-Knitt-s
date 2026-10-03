package com.ecommerce.cart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private String sku;
    private String title;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
