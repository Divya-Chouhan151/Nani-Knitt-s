package com.ecommerce.product.mapper;

import com.ecommerce.product.domain.Category;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductImage;
import com.ecommerce.product.domain.ProductVariant;
import com.ecommerce.product.dto.response.CategoryRefDto;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductImageDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;
import com.ecommerce.product.dto.response.ProductVariantDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductSummaryDto toSummaryDto(Product product) {
        if (product == null) {
            return null;
        }

        ProductSummaryDto.ProductSummaryDtoBuilder productSummaryDto = ProductSummaryDto.builder();

        productSummaryDto.price(mapPrice(product));
        productSummaryDto.compareAtPrice(mapCompareAtPrice(product));
        productSummaryDto.stockStatus(mapStockStatus(product));
        productSummaryDto.thumbnailUrl(mapThumbnailUrl(product));
        productSummaryDto.id(product.getId());
        productSummaryDto.title(product.getTitle());
        productSummaryDto.slug(product.getSlug());
        productSummaryDto.shortDescription(product.getShortDescription());
        productSummaryDto.category(categoryToCategoryRefDto(product.getCategory()));
        productSummaryDto.averageRating(product.getAverageRating());
        productSummaryDto.reviewCount(product.getReviewCount());
        productSummaryDto.badge(product.getBadge());
        productSummaryDto.createdAt(product.getCreatedAt());
        productSummaryDto.currency("INR");

        return productSummaryDto.build();
    }

    @Override
    public ProductDetailDto toDetailDto(Product product) {
        if (product == null) {
            return null;
        }

        ProductDetailDto.ProductDetailDtoBuilder productDetailDto = ProductDetailDto.builder();

        productDetailDto.price(mapPrice(product));
        productDetailDto.compareAtPrice(mapCompareAtPrice(product));
        productDetailDto.stockStatus(mapStockStatus(product));
        productDetailDto.thumbnailUrl(mapThumbnailUrl(product));
        productDetailDto.id(product.getId());
        productDetailDto.title(product.getTitle());
        productDetailDto.slug(product.getSlug());
        productDetailDto.shortDescription(product.getShortDescription());
        productDetailDto.description(product.getDescription());
        productDetailDto.category(categoryToCategoryRefDto(product.getCategory()));
        productDetailDto.averageRating(product.getAverageRating());
        productDetailDto.reviewCount(product.getReviewCount());
        productDetailDto.badge(product.getBadge());
        productDetailDto.images(productImageListToProductImageDtoList(product.getImages()));
        productDetailDto.variants(productVariantListToProductVariantDtoList(product.getVariants()));
        productDetailDto.createdAt(product.getCreatedAt());
        productDetailDto.updatedAt(product.getUpdatedAt());
        productDetailDto.currency("INR");
        productDetailDto.returnPolicy("10-Day Replacement & Return Guarantee with Doorstep Pickup.");
        productDetailDto.warranty("2-Year Comprehensive Brand Warranty.");

        return productDetailDto.build();
    }

    @Override
    public ProductImageDto toImageDto(ProductImage image) {
        if (image == null) {
            return null;
        }

        ProductImageDto.ProductImageDtoBuilder productImageDto = ProductImageDto.builder();

        productImageDto.id(image.getId());
        productImageDto.url(image.getUrl());
        productImageDto.altText(image.getAltText());
        productImageDto.isPrimary(image.getIsPrimary());
        productImageDto.sortOrder(image.getSortOrder());

        return productImageDto.build();
    }

    @Override
    public ProductVariantDto toVariantDto(ProductVariant variant) {
        if (variant == null) {
            return null;
        }

        ProductVariantDto.ProductVariantDtoBuilder productVariantDto = ProductVariantDto.builder();

        productVariantDto.id(variant.getId());
        productVariantDto.sku(variant.getSku());
        productVariantDto.price(variant.getPrice());
        productVariantDto.compareAtPrice(variant.getCompareAtPrice());
        productVariantDto.barcode(variant.getBarcode());
        productVariantDto.stockQuantity(variant.getStockQuantity());
        productVariantDto.stockStatus(variant.getStockStatus());
        productVariantDto.isDefault(variant.getIsDefault());

        return productVariantDto.build();
    }

    protected CategoryRefDto categoryToCategoryRefDto(Category category) {
        if (category == null) {
            return null;
        }

        CategoryRefDto categoryRefDto = new CategoryRefDto();
        categoryRefDto.setId(category.getId());
        categoryRefDto.setName(category.getName());
        categoryRefDto.setSlug(category.getSlug());

        return categoryRefDto;
    }

    protected List<ProductImageDto> productImageListToProductImageDtoList(List<ProductImage> list) {
        if (list == null) {
            return null;
        }

        List<ProductImageDto> list1 = new ArrayList<>(list.size());
        for (ProductImage productImage : list) {
            list1.add(toImageDto(productImage));
        }

        return list1;
    }

    protected List<ProductVariantDto> productVariantListToProductVariantDtoList(List<ProductVariant> list) {
        if (list == null) {
            return null;
        }

        List<ProductVariantDto> list1 = new ArrayList<>(list.size());
        for (ProductVariant productVariant : list) {
            list1.add(toVariantDto(productVariant));
        }

        return list1;
    }
}
