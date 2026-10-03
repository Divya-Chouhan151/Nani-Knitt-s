package com.ecommerce.auth.dto.request;

import com.ecommerce.auth.util.FlexibleUuidDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemRequest {
    @NotNull(message = "Product ID is required")
    @JsonDeserialize(using = FlexibleUuidDeserializer.class)
    private UUID productId;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Product title is required")
    private String title;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private String imageUrl;
}
