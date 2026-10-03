package com.ecommerce.product.controller;

import com.ecommerce.product.dto.request.ProductFilterCriteria;
import com.ecommerce.product.dto.response.CategoryRefDto;
import com.ecommerce.product.dto.response.PageResponse;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductImageDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;
import com.ecommerce.product.dto.response.ProductVariantDto;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.ecommerce.product.exception.GlobalExceptionHandler;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/v1/products with valid params returns 200 OK with INR currency")
    void shouldReturnProductsWhenValid() throws Exception {
        ProductSummaryDto dto = ProductSummaryDto.builder()
                .id(UUID.randomUUID())
                .title("Ergonomic Keyboard")
                .slug("ergonomic-keyboard")
                .shortDescription("Mechanical dual-mode keyboard")
                .category(new CategoryRefDto(UUID.randomUUID(), "Keyboards", "keyboards"))
                .thumbnailUrl("https://example.com/kb.jpg")
                .price(new BigDecimal("11049.00"))
                .currency("INR")
                .averageRating(new BigDecimal("4.85"))
                .reviewCount(142)
                .stockStatus("IN_STOCK")
                .badge("BESTSELLER")
                .createdAt(Instant.parse("2026-08-15T10:30:00Z"))
                .build();

        PageResponse<ProductSummaryDto> response = PageResponse.<ProductSummaryDto>builder()
                .content(List.of(dto))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1)
                .totalPages(1)
                .isFirst(true)
                .isLast(true)
                .build();

        when(productService.getProducts(any(ProductFilterCriteria.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/products")
                        .param("page", "0")
                        .param("size", "20")
                        .param("sort", "price_asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Ergonomic Keyboard"))
                .andExpect(jsonPath("$.content[0].price").value(11049.00))
                .andExpect(jsonPath("$.content[0].currency").value("INR"))
                .andExpect(jsonPath("$.content[0].stockStatus").value("IN_STOCK"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/products/{idOrSlug} returns full product details and gallery images")
    void shouldReturnProductDetail() throws Exception {
        ProductDetailDto detailDto = ProductDetailDto.builder()
                .id(UUID.randomUUID())
                .title("Bamboo Keyboard")
                .slug("bamboo-keyboard")
                .description("Handmade bamboo mechanical keyboard.")
                .category(new CategoryRefDto(UUID.randomUUID(), "Keyboards", "keyboards"))
                .thumbnailUrl("https://example.com/thumb.jpg")
                .price(new BigDecimal("11049.00"))
                .compareAtPrice(new BigDecimal("13599.00"))
                .currency("INR")
                .averageRating(new BigDecimal("4.85"))
                .reviewCount(142)
                .stockStatus("IN_STOCK")
                .images(List.of(
                        new ProductImageDto(UUID.randomUUID(), "https://example.com/1.jpg", "Front", true, 0),
                        new ProductImageDto(UUID.randomUUID(), "https://example.com/2.jpg", "Side", false, 1)
                ))
                .variants(List.of(
                        new ProductVariantDto(UUID.randomUUID(), "SKU-BAM-01", new BigDecimal("11049.00"), new BigDecimal("13599.00"), "12345", 25, "IN_STOCK", true)
                ))
                .returnPolicy("10-Day Replacement Policy")
                .warranty("2-Year Warranty")
                .build();

        when(productService.getProductByIdOrSlug(eq("bamboo-keyboard"))).thenReturn(detailDto);

        mockMvc.perform(get("/api/v1/products/bamboo-keyboard")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Bamboo Keyboard"))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.images.length()").value(2))
                .andExpect(jsonPath("$.returnPolicy").value("10-Day Replacement Policy"));
    }

    @Test
    @DisplayName("GET /api/v1/products/{idOrSlug} returns 404 when product not found")
    void shouldReturn404WhenProductNotFound() throws Exception {
        when(productService.getProductByIdOrSlug(eq("unknown-slug")))
                .thenThrow(new ProductNotFoundException("Product with identifier 'unknown-slug' not found"));

        mockMvc.perform(get("/api/v1/products/unknown-slug")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Product Not Found"));
    }

    @Test
    @DisplayName("GET /api/v1/products with size > 100 rejects with 400 Bad Request")
    void shouldRejectWhenSizeExceedsLimit() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("size", "150")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details[0].field").value("size"));
    }

    @Test
    @DisplayName("GET /api/v1/products with invalid sort value rejects with 400 Bad Request")
    void shouldRejectWhenSortInvalid() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("sort", "invalid_sort_option")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details[0].field").value("sort"));
    }

    @Test
    @DisplayName("GET /api/v1/products with minRating > 5.0 rejects with 400 Bad Request")
    void shouldRejectWhenRatingExceedsFive() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("minRating", "5.5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details[0].field").value("minRating"));
    }
}
