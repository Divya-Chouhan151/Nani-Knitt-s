package com.ecommerce.product.repository;

import com.ecommerce.product.domain.Product;
import com.ecommerce.product.dto.request.ProductFilterCriteria;
import com.ecommerce.product.specification.ProductSpecifications;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ProductRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("ecommerce_product_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("Should fetch seeded products from real PostgreSQL container")
    void shouldFindAllProductsFromSeed() {
        Specification<Product> spec = ProductSpecifications.withCriteria(new ProductFilterCriteria());
        Page<Product> page = productRepository.findAll(spec, PageRequest.of(0, 20));

        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(8);
        assertThat(page.getContent()).anyMatch(p -> p.getSlug().equals("ergonomic-bamboo-wireless-mechanical-keyboard"));
    }

    @Test
    @DisplayName("Should filter products by categorySlug and price bounds in PostgreSQL")
    void shouldFilterByCategoryAndPrice() {
        ProductFilterCriteria criteria = new ProductFilterCriteria();
        criteria.setCategorySlug("keyboards-and-mice");
        criteria.setMinPrice(new BigDecimal("4000.00"));
        criteria.setMaxPrice(new BigDecimal("15000.00"));

        Specification<Product> spec = ProductSpecifications.withCriteria(criteria);
        Page<Product> page = productRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent()).allMatch(p -> p.getCategory().getSlug().equals("keyboards-and-mice"));
    }

    @Test
    @DisplayName("Should filter products by keyword query in PostgreSQL")
    void shouldFilterByKeywordQuery() {
        ProductFilterCriteria criteria = new ProductFilterCriteria();
        criteria.setQuery("bamboo");

        Specification<Product> spec = ProductSpecifications.withCriteria(criteria);
        Page<Product> page = productRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getTitle()).contains("Bamboo");
    }
}
