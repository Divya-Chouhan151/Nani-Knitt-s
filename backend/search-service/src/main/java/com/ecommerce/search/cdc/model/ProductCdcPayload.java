package com.ecommerce.search.cdc.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductCdcPayload {

    private String id;

    @JsonProperty("category_id")
    private String categoryId;

    private String title;
    private String slug;

    @JsonProperty("short_description")
    private String shortDescription;

    private String description;

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("is_featured")
    private Boolean isFeatured;

    private String badge;

    @JsonProperty("average_rating")
    private BigDecimal averageRating;

    @JsonProperty("review_count")
    private Integer reviewCount;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;
}
