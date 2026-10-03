package com.ecommerce.product.service;

import com.ecommerce.product.domain.Category;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductImage;
import com.ecommerce.product.domain.ProductVariant;
import com.ecommerce.product.dto.request.ProductFilterCriteria;
import com.ecommerce.product.dto.response.PageResponse;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.mapper.ProductMapper;
import com.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductMapper productMapper;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productMapper = Mappers.getMapper(ProductMapper.class);
        productService = new ProductServiceImpl(productRepository, productMapper);
    }

    @Test
    @DisplayName("getProducts should map entities to DTOs including default variant price and primary image")
    void shouldReturnMappedProductPage() {
        Category category = new Category(UUID.randomUUID(), "Keyboards", "keyboards", "/keyboards");
        Product product = new Product(UUID.randomUUID(), "Mechanical Keyboard", "mechanical-keyboard", category);
        product.setAverageRating(new BigDecimal("4.85"));
        product.setReviewCount(142);
        product.setBadge("BESTSELLER");

        ProductVariant variant = new ProductVariant(UUID.randomUUID(), "SKU-001", new BigDecimal("11049.00"), 25, true);
        variant.setCompareAtPrice(new BigDecimal("13599.00"));
        product.addVariant(variant);

        ProductImage image = new ProductImage(UUID.randomUUID(), "https://example.com/kb.jpg", "KB", true);
        product.addImage(image);

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));

        ProductFilterCriteria criteria = new ProductFilterCriteria();
        criteria.setPage(0);
        criteria.setSize(10);

        PageResponse<ProductSummaryDto> response = productService.getProducts(criteria);

        assertThat(response.getContent()).hasSize(1);
        ProductSummaryDto dto = response.getContent().get(0);
        assertThat(dto.getTitle()).isEqualTo("Mechanical Keyboard");
        assertThat(dto.getPrice()).isEqualByComparingTo(new BigDecimal("11049.00"));
        assertThat(dto.getCurrency()).isEqualTo("INR");
        assertThat(dto.getStockStatus()).isEqualTo("IN_STOCK");

        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("getProductByIdOrSlug should return detailed DTO with images, variants, and return policy")
    void shouldReturnProductDetail() {
        Category category = new Category(UUID.randomUUID(), "Keyboards", "keyboards", "/keyboards");
        Product product = new Product(UUID.randomUUID(), "Bamboo Keyboard", "bamboo-keyboard", category);
        product.setDescription("Full description of bamboo keyboard.");
        product.setAverageRating(new BigDecimal("4.85"));
        product.setReviewCount(142);

        ProductVariant variant = new ProductVariant(UUID.randomUUID(), "SKU-001", new BigDecimal("11049.00"), 25, true);
        product.addVariant(variant);

        ProductImage image1 = new ProductImage(UUID.randomUUID(), "https://example.com/kb-1.jpg", "Front", true);
        ProductImage image2 = new ProductImage(UUID.randomUUID(), "https://example.com/kb-2.jpg", "Side", false);
        product.addImage(image1);
        product.addImage(image2);

        when(productRepository.findBySlug("bamboo-keyboard")).thenReturn(Optional.of(product));

        ProductDetailDto detailDto = productService.getProductByIdOrSlug("bamboo-keyboard");

        assertThat(detailDto.getTitle()).isEqualTo("Bamboo Keyboard");
        assertThat(detailDto.getCurrency()).isEqualTo("INR");
        assertThat(detailDto.getImages()).hasSize(2);
        assertThat(detailDto.getReturnPolicy()).contains("10-Day Replacement");
        assertThat(detailDto.getWarranty()).contains("2-Year");
    }

    @Test
    @DisplayName("getProductByIdOrSlug should throw ProductNotFoundException when product does not exist")
    void shouldThrowWhenNotFound() {
        when(productRepository.findBySlug("non-existent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductByIdOrSlug("non-existent"))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("non-existent");
    }
}
