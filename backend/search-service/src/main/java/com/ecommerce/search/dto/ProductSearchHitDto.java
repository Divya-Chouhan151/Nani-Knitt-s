package com.ecommerce.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchHitDto {

    private String id;
    private String title;
    private String slug;
    private String shortDescription;
    private String categoryName;
    private String categorySlug;
    private String brand;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Double averageRating;
    private Integer reviewCount;
    private String stockStatus;
    private String thumbnailUrl;
    private String badge;
    private Double score;
}
