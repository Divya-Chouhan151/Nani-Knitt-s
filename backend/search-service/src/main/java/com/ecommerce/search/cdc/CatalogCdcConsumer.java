package com.ecommerce.search.cdc;

import com.ecommerce.search.cdc.model.CategoryCdcPayload;
import com.ecommerce.search.cdc.model.CdcEvent;
import com.ecommerce.search.cdc.model.ProductCdcPayload;
import com.ecommerce.search.cdc.model.VariantCdcPayload;
import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.domain.ProductSearchDocument;
import com.ecommerce.search.engine.SearchIndexClient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogCdcConsumer {

    private final SearchIndexClient indexClient;
    private final SearchProperties searchProperties;
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @KafkaListener(topics = "${search.topics.products:ecommerce.cdc.catalog.products}", groupId = "${spring.kafka.consumer.group-id:search-service-cdc-group}")
    public void handleProductEvent(String message) {
        try {
            CdcEvent<ProductCdcPayload> event = objectMapper.readValue(message, new TypeReference<>() {});
            processProductCdc(event);
        } catch (Exception e) {
            log.error("Failed to parse or process product CDC event: {}", message, e);
            sendToDlq(searchProperties.getTopics().getDlq(), message, e.getMessage());
        }
    }

    @KafkaListener(topics = "${search.topics.variants:ecommerce.cdc.catalog.product_variants}", groupId = "${spring.kafka.consumer.group-id:search-service-cdc-group}")
    public void handleVariantEvent(String message) {
        try {
            CdcEvent<VariantCdcPayload> event = objectMapper.readValue(message, new TypeReference<>() {});
            processVariantCdc(event);
        } catch (Exception e) {
            log.error("Failed to parse or process variant CDC event: {}", message, e);
            sendToDlq(searchProperties.getTopics().getDlq(), message, e.getMessage());
        }
    }

    @KafkaListener(topics = "${search.topics.categories:ecommerce.cdc.catalog.categories}", groupId = "${spring.kafka.consumer.group-id:search-service-cdc-group}")
    public void handleCategoryEvent(String message) {
        try {
            CdcEvent<CategoryCdcPayload> event = objectMapper.readValue(message, new TypeReference<>() {});
            processCategoryCdc(event);
        } catch (Exception e) {
            log.error("Failed to parse or process category CDC event: {}", message, e);
            sendToDlq(searchProperties.getTopics().getDlq(), message, e.getMessage());
        }
    }

    public void processProductCdc(CdcEvent<ProductCdcPayload> event) {
        if (event == null || event.getOp() == null) {
            return;
        }

        String op = event.getOp().toLowerCase();
        if ("d".equals(op)) {
            // Delete operation
            if (event.getBefore() != null && event.getBefore().getId() != null) {
                log.info("CDC Delete product id={}", event.getBefore().getId());
                indexClient.deleteDocument(event.getBefore().getId());
            }
            return;
        }

        ProductCdcPayload payload = event.getAfter();
        if (payload == null || payload.getId() == null) {
            return;
        }

        // Idempotency check: compare event tsMs or updatedAt against indexed version
        ProductSearchDocument existing = indexClient.getDocument(payload.getId());
        long eventTime = event.getTsMs() != null ? event.getTsMs() : System.currentTimeMillis();

        if (existing != null && existing.getVersion() != null && existing.getVersion() > eventTime) {
            log.debug("Dropping out-of-order product CDC event for id={}, eventTime={}, currentVersion={}",
                    payload.getId(), eventTime, existing.getVersion());
            return;
        }

        ProductSearchDocument.ProductSearchDocumentBuilder builder = existing != null
                ? ProductSearchDocument.builder()
                .id(existing.getId())
                .price(existing.getPrice())
                .compareAtPrice(existing.getCompareAtPrice())
                .stockQuantity(existing.getStockQuantity())
                .stockStatus(existing.getStockStatus())
                .categoryName(existing.getCategoryName())
                .categorySlug(existing.getCategorySlug())
                .brand(existing.getBrand())
                .thumbnailUrl(existing.getThumbnailUrl())
                .suggest(new ArrayList<>(existing.getSuggest() != null ? existing.getSuggest() : List.of()))
                : ProductSearchDocument.builder().id(payload.getId()).suggest(new ArrayList<>());

        // Build suggestions
        List<String> suggestions = new ArrayList<>();
        if (payload.getTitle() != null) {
            suggestions.add(payload.getTitle().toLowerCase());
        }

        ProductSearchDocument updatedDoc = builder
                .id(payload.getId())
                .title(payload.getTitle())
                .slug(payload.getSlug())
                .shortDescription(payload.getShortDescription())
                .description(payload.getDescription())
                .isActive(payload.getIsActive() != null ? payload.getIsActive() : true)
                .averageRating(payload.getAverageRating() != null ? payload.getAverageRating().doubleValue() : 0.0)
                .reviewCount(payload.getReviewCount() != null ? payload.getReviewCount() : 0)
                .badge(payload.getBadge())
                .updatedAt(Instant.ofEpochMilli(eventTime))
                .version(eventTime)
                .suggest(suggestions)
                .build();

        indexClient.indexDocument(updatedDoc);
        log.debug("Successfully indexed product CDC event for id={}", payload.getId());
    }

    public void processVariantCdc(CdcEvent<VariantCdcPayload> event) {
        if (event == null || event.getAfter() == null) return;
        VariantCdcPayload payload = event.getAfter();
        if (payload.getProductId() == null) return;

        ProductSearchDocument doc = indexClient.getDocument(payload.getProductId());
        if (doc != null) {
            if (Boolean.TRUE.equals(payload.getIsDefault()) || doc.getPrice() == null) {
                doc.setPrice(payload.getPrice());
                doc.setCompareAtPrice(payload.getCompareAtPrice());
                doc.setStockQuantity(payload.getStockQuantity());
                doc.setStockStatus(payload.getStockStatus() != null ? payload.getStockStatus() : "IN_STOCK");
                doc.setVersion(event.getTsMs() != null ? event.getTsMs() : System.currentTimeMillis());
                indexClient.indexDocument(doc);
                log.debug("Updated pricing/inventory from variant CDC for product id={}", doc.getId());
            }
        }
    }

    public void processCategoryCdc(CdcEvent<CategoryCdcPayload> event) {
        if (event == null || event.getAfter() == null) return;
        CategoryCdcPayload payload = event.getAfter();
        if (payload.getId() == null) return;

        log.debug("Received category CDC update for name='{}', slug='{}'", payload.getName(), payload.getSlug());
    }

    private void sendToDlq(String dlqTopic, String originalMessage, String errorReason) {
        try {
            if (kafkaTemplate != null && dlqTopic != null) {
                kafkaTemplate.send(dlqTopic, originalMessage);
            }
        } catch (Exception e) {
            log.warn("Unable to publish poison pill to DLQ topic {}: {}", dlqTopic, e.getMessage());
        }
    }
}
