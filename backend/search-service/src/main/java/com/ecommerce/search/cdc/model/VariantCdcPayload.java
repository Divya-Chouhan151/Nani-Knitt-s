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
public class VariantCdcPayload {

    private String id;

    @JsonProperty("product_id")
    private String productId;

    private String sku;
    private BigDecimal price;

    @JsonProperty("compare_at_price")
    private BigDecimal compareAtPrice;

    @JsonProperty("stock_quantity")
    private Integer stockQuantity;

    @JsonProperty("stock_status")
    private String stockStatus;

    @JsonProperty("is_default")
    private Boolean isDefault;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;
}
