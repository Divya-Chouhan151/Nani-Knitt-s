package com.ecommerce.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDto {
    private UUID id;
    private String sku;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private String barcode;
    private Integer stockQuantity;
    private String stockStatus;
    private Boolean isDefault;
}
