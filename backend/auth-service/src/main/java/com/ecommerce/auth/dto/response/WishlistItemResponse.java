package com.ecommerce.auth.dto.response;

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
public class WishlistItemResponse {
    private UUID id;
    private UUID productId;
    private String sku;
    private String title;
    private BigDecimal price;
    private String imageUrl;
    private Boolean inStock;
    private Instant createdAt;
}
