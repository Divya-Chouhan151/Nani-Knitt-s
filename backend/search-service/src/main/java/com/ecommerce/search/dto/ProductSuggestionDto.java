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
public class ProductSuggestionDto {
    private String id;
    private String title;
    private String slug;
    private String categoryName;
    private BigDecimal price;
    private String thumbnailUrl;
}
