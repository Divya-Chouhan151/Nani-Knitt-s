package com.ecommerce.product.service;

import com.ecommerce.product.dto.request.ProductFilterCriteria;
import com.ecommerce.product.dto.response.PageResponse;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;

public interface ProductService {
    PageResponse<ProductSummaryDto> getProducts(ProductFilterCriteria criteria);
    ProductDetailDto getProductByIdOrSlug(String idOrSlug);
}
