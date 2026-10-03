package com.ecommerce.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryDto {
    private UUID id;
    private String title;
    private String slug;
    private String shortDescription;
    private CategoryRefDto category;
    private String thumbnailUrl;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private String currency;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private String stockStatus;
    private String badge;
    private Instant createdAt;
}
