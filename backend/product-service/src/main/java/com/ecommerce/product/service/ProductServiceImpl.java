package com.ecommerce.product.service;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.dto.request.ProductFilterCriteria;
import com.ecommerce.product.dto.response.PageResponse;
import com.ecommerce.product.dto.response.ProductDetailDto;
import com.ecommerce.product.dto.response.ProductSummaryDto;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.mapper.ProductMapper;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.specification.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryDto> getProducts(ProductFilterCriteria criteria) {
        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 20;

        Pageable pageable = PageRequest.of(page, size);
        Specification<Product> spec = ProductSpecifications.withCriteria(criteria);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        Page<ProductSummaryDto> dtoPage = productPage.map(productMapper::toSummaryDto);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductByIdOrSlug(String idOrSlug) {
        Optional<Product> productOpt = Optional.empty();

        try {
            UUID uuid = UUID.fromString(idOrSlug);
            productOpt = productRepository.findById(uuid);
        } catch (IllegalArgumentException ignored) {
            // Not a valid UUID, search by slug
        }

        if (productOpt.isEmpty()) {
            productOpt = productRepository.findBySlug(idOrSlug);
        }

        Product product = productOpt
                .filter(Product::getIsActive)
                .orElseThrow(() -> new ProductNotFoundException("Product with identifier '" + idOrSlug + "' not found"));

        return productMapper.toDetailDto(product);
    }
}
