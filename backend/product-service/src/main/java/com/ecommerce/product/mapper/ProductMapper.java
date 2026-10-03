package com.ecommerce.product.mapper;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductImage;
import com.ecommerce.product.domain.ProductVariant;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductImageDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;
import com.ecommerce.product.dto.response.ProductVariantDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;

public interface ProductMapper {

    @Mapping(target = "price", source = "product", qualifiedByName = "mapPrice")
    @Mapping(target = "compareAtPrice", source = "product", qualifiedByName = "mapCompareAtPrice")
    @Mapping(target = "stockStatus", source = "product", qualifiedByName = "mapStockStatus")
    @Mapping(target = "thumbnailUrl", source = "product", qualifiedByName = "mapThumbnailUrl")
    @Mapping(target = "currency", constant = "INR")
    ProductSummaryDto toSummaryDto(Product product);

    @Mapping(target = "price", source = "product", qualifiedByName = "mapPrice")
    @Mapping(target = "compareAtPrice", source = "product", qualifiedByName = "mapCompareAtPrice")
    @Mapping(target = "stockStatus", source = "product", qualifiedByName = "mapStockStatus")
    @Mapping(target = "thumbnailUrl", source = "product", qualifiedByName = "mapThumbnailUrl")
    @Mapping(target = "currency", constant = "INR")
    @Mapping(target = "returnPolicy", constant = "10-Day Replacement & Return Guarantee with Doorstep Pickup.")
    @Mapping(target = "warranty", constant = "2-Year Comprehensive Brand Warranty.")
    ProductDetailDto toDetailDto(Product product);

    ProductImageDto toImageDto(ProductImage image);

    ProductVariantDto toVariantDto(ProductVariant variant);

    @Named("mapPrice")
    default BigDecimal mapPrice(Product product) {
        ProductVariant variant = product.getDefaultVariant();
        return variant != null ? variant.getPrice() : BigDecimal.ZERO;
    }

    @Named("mapCompareAtPrice")
    default BigDecimal mapCompareAtPrice(Product product) {
        ProductVariant variant = product.getDefaultVariant();
        return variant != null ? variant.getCompareAtPrice() : null;
    }

    @Named("mapStockStatus")
    default String mapStockStatus(Product product) {
        ProductVariant variant = product.getDefaultVariant();
        return variant != null ? variant.getStockStatus() : "OUT_OF_STOCK";
    }

    @Named("mapThumbnailUrl")
    default String mapThumbnailUrl(Product product) {
        ProductImage image = product.getPrimaryImage();
        return image != null ? image.getUrl() : "";
    }
}
