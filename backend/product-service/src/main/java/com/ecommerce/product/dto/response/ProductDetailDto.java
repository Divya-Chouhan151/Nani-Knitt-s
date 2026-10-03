package com.ecommerce.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDto {
    private UUID id;
    private String title;
    private String slug;
    private String shortDescription;
    private String description;
    private CategoryRefDto category;
    private String thumbnailUrl;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private String currency;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private String stockStatus;
    private String badge;
    private List<ProductImageDto> images;
    private List<ProductVariantDto> variants;
    private String returnPolicy;
    private String warranty;
    private Instant createdAt;
    private Instant updatedAt;
}
