package com.ecommerce.product.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class ProductFilterCriteria {

    @Min(value = 0, message = "page must be greater than or equal to 0")
    private Integer page = 0;

    @Min(value = 1, message = "size must be at least 1")
    @Max(value = 100, message = "size must be less than or equal to 100")
    private Integer size = 20;

    @Pattern(regexp = "price_asc|price_desc|newest|rating_desc", message = "sort must be one of: price_asc, price_desc, newest, rating_desc")
    private String sort = "newest";

    private UUID categoryId;

    @Size(max = 100, message = "categorySlug must not exceed 100 characters")
    private String categorySlug;

    @Size(max = 120, message = "query must not exceed 120 characters")
    private String query;

    @PositiveOrZero(message = "minPrice must be positive or zero")
    private BigDecimal minPrice;

    @PositiveOrZero(message = "maxPrice must be positive or zero")
    private BigDecimal maxPrice;

    @DecimalMin(value = "1.0", message = "minRating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "minRating must be at most 5.0")
    private BigDecimal minRating;

    private Boolean inStockOnly = false;
}
