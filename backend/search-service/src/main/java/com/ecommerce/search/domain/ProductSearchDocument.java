package com.ecommerce.search.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchDocument {

    private String id;
    private String slug;
    private String title;
    private String shortDescription;
    private String description;
    private String categoryName;
    private String categorySlug;
    private String brand;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Double averageRating;
    private Integer reviewCount;
    private Integer stockQuantity;
    private String stockStatus;
    private String thumbnailUrl;
    private String badge;
    private Boolean isActive;
    private Instant updatedAt;
    private Long version;

    @Builder.Default
    private List<String> suggest = new ArrayList<>();
}
