package com.ecommerce.search.cdc;

import com.ecommerce.search.cdc.model.CdcEvent;
import com.ecommerce.search.cdc.model.ProductCdcPayload;
import com.ecommerce.search.cdc.model.VariantCdcPayload;
import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.domain.ProductSearchDocument;
import com.ecommerce.search.engine.InMemorySearchIndexClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class CatalogCdcConsumerTest {

    private InMemorySearchIndexClient indexClient;
    private CatalogCdcConsumer consumer;

    @BeforeEach
    void setUp() {
        indexClient = new InMemorySearchIndexClient();
        indexClient.clear();
        SearchProperties properties = new SearchProperties();
        ObjectMapper objectMapper = new ObjectMapper();
        @SuppressWarnings("unchecked")
        KafkaTemplate<String, String> kafkaTemplate = mock(KafkaTemplate.class);
        consumer = new CatalogCdcConsumer(indexClient, properties, objectMapper, kafkaTemplate);
    }

    @Test
    void processProductCreateIndexesNewDocument() {
        ProductCdcPayload payload = ProductCdcPayload.builder()
                .id("test-prod-1")
                .title("Ergonomic Keyboard")
                .slug("ergonomic-keyboard")
                .shortDescription("Ergonomic mechanical keyboard")
                .isActive(true)
                .averageRating(new BigDecimal("4.80"))
                .reviewCount(50)
                .build();

        CdcEvent<ProductCdcPayload> event = CdcEvent.<ProductCdcPayload>builder()
                .op("c")
                .tsMs(1000L)
                .after(payload)
                .build();

        consumer.processProductCdc(event);

        ProductSearchDocument doc = indexClient.getDocument("test-prod-1");
        assertThat(doc).isNotNull();
        assertThat(doc.getTitle()).isEqualTo("Ergonomic Keyboard");
        assertThat(doc.getSlug()).isEqualTo("ergonomic-keyboard");
    }

    @Test
    void processProductDeleteRemovesDocument() {
        ProductSearchDocument existing = ProductSearchDocument.builder()
                .id("test-prod-2")
                .title("To Delete")
                .slug("to-delete")
                .build();
        indexClient.indexDocument(existing);
        assertThat(indexClient.getDocument("test-prod-2")).isNotNull();

        CdcEvent<ProductCdcPayload> event = CdcEvent.<ProductCdcPayload>builder()
                .op("d")
                .tsMs(2000L)
                .before(ProductCdcPayload.builder().id("test-prod-2").build())
                .build();

        consumer.processProductCdc(event);

        assertThat(indexClient.getDocument("test-prod-2")).isNull();
    }

    @Test
    void processVariantUpdatesPriceAndStockOnProduct() {
        ProductSearchDocument doc = ProductSearchDocument.builder()
                .id("test-prod-3")
                .title("Aura Mouse")
                .slug("aura-mouse")
                .price(new BigDecimal("10.00"))
                .stockQuantity(1)
                .stockStatus("LOW_STOCK")
                .build();
        indexClient.indexDocument(doc);

        VariantCdcPayload variantPayload = VariantCdcPayload.builder()
                .id("variant-1")
                .productId("test-prod-3")
                .isDefault(true)
                .price(new BigDecimal("29.99"))
                .compareAtPrice(new BigDecimal("39.99"))
                .stockQuantity(100)
                .stockStatus("IN_STOCK")
                .build();

        CdcEvent<VariantCdcPayload> event = CdcEvent.<VariantCdcPayload>builder()
                .op("u")
                .tsMs(3000L)
                .after(variantPayload)
                .build();

        consumer.processVariantCdc(event);

        ProductSearchDocument updated = indexClient.getDocument("test-prod-3");
        assertThat(updated).isNotNull();
        assertThat(updated.getPrice()).isEqualTo(new BigDecimal("29.99"));
        assertThat(updated.getStockQuantity()).isEqualTo(100);
        assertThat(updated.getStockStatus()).isEqualTo("IN_STOCK");
    }

    @Test
    void outOfOrderEventIsSafelyDropped() {
        ProductSearchDocument doc = ProductSearchDocument.builder()
                .id("test-prod-4")
                .title("Latest Title")
                .slug("latest-title")
                .version(5000L)
                .build();
        indexClient.indexDocument(doc);

        // Event with older timestamp
        ProductCdcPayload olderPayload = ProductCdcPayload.builder()
                .id("test-prod-4")
                .title("Older Out Of Order Title")
                .slug("older-title")
                .build();

        CdcEvent<ProductCdcPayload> event = CdcEvent.<ProductCdcPayload>builder()
                .op("u")
                .tsMs(4000L) // strictly older than 5000L
                .after(olderPayload)
                .build();

        consumer.processProductCdc(event);

        ProductSearchDocument current = indexClient.getDocument("test-prod-4");
        assertThat(current.getTitle()).isEqualTo("Latest Title");
    }
}
