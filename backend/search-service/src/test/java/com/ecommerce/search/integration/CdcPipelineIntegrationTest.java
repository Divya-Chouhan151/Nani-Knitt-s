package com.ecommerce.search.integration;

import com.ecommerce.search.cdc.CatalogCdcConsumer;
import com.ecommerce.search.cdc.model.CdcEvent;
import com.ecommerce.search.cdc.model.ProductCdcPayload;
import com.ecommerce.search.cdc.model.VariantCdcPayload;
import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.engine.InMemorySearchIndexClient;
import com.ecommerce.search.service.SearchServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class CdcPipelineIntegrationTest {

    private InMemorySearchIndexClient indexClient;
    private CatalogCdcConsumer consumer;
    private SearchServiceImpl searchService;

    @BeforeEach
    void setUp() {
        indexClient = new InMemorySearchIndexClient();
        indexClient.clear();
        SearchProperties properties = new SearchProperties();
        ObjectMapper objectMapper = new ObjectMapper();
        @SuppressWarnings("unchecked")
        KafkaTemplate<String, String> kafkaTemplate = mock(KafkaTemplate.class);

        consumer = new CatalogCdcConsumer(indexClient, properties, objectMapper, kafkaTemplate);
        searchService = new SearchServiceImpl(indexClient, properties);
    }

    @Test
    void cdcEventIndexedAndSearchableWithCorrectFacets() {
        // Step 1: Simulate Product CDC event
        ProductCdcPayload product = ProductCdcPayload.builder()
                .id("cdc-prod-100")
                .title("Aura ANC Pro Wireless Headphones")
                .slug("aura-anc-pro-wireless-headphones")
                .shortDescription("Noise cancelling headphones")
                .isActive(true)
                .badge("NEW")
                .averageRating(new BigDecimal("4.85"))
                .reviewCount(45)
                .build();

        consumer.processProductCdc(CdcEvent.<ProductCdcPayload>builder()
                .op("c")
                .tsMs(System.currentTimeMillis())
                .after(product)
                .build());

        // Step 2: Simulate Variant CDC event with price and stock
        VariantCdcPayload variant = VariantCdcPayload.builder()
                .id("cdc-var-100")
                .productId("cdc-prod-100")
                .isDefault(true)
                .price(new BigDecimal("199.99"))
                .compareAtPrice(new BigDecimal("249.99"))
                .stockQuantity(25)
                .stockStatus("IN_STOCK")
                .build();

        consumer.processVariantCdc(CdcEvent.<VariantCdcPayload>builder()
                .op("c")
                .tsMs(System.currentTimeMillis())
                .after(variant)
                .build());

        // Step 3: Search for the newly indexed product
        SearchRequest searchRequest = SearchRequest.builder()
                .q("Headphones")
                .build();

        SearchResultDto searchResult = searchService.search(searchRequest);

        // Step 4: Verify search results & facets
        assertThat(searchResult.getContent()).hasSize(1);
        assertThat(searchResult.getContent().get(0).getTitle()).isEqualTo("Aura ANC Pro Wireless Headphones");
        assertThat(searchResult.getContent().get(0).getPrice()).isEqualByComparingTo("199.99");
        assertThat(searchResult.getContent().get(0).getStockStatus()).isEqualTo("IN_STOCK");

        // Verify stock status facet includes IN_STOCK
        assertThat(searchResult.getFacets().getStockStatuses())
                .anyMatch(s -> "IN_STOCK".equals(s.getKey()) && s.getCount() >= 1);
    }
}
