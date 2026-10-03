package com.ecommerce.product.controller;

import com.ecommerce.product.dto.request.ProductFilterCriteria;
import com.ecommerce.product.dto.response.PageResponse;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;
import com.ecommerce.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductSummaryDto>> getProducts(@Valid @ModelAttribute ProductFilterCriteria criteria) {
        PageResponse<ProductSummaryDto> response = productService.getProducts(criteria);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<ProductDetailDto> getProductByIdOrSlug(@PathVariable("idOrSlug") String idOrSlug) {
        ProductDetailDto response = productService.getProductByIdOrSlug(idOrSlug);
        return ResponseEntity.ok(response);
    }
}
