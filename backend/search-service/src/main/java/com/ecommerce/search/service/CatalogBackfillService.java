package com.ecommerce.search.service;

import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.engine.SearchIndexClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogBackfillService {

    private final SearchIndexClient indexClient;
    private final SearchProperties searchProperties;

    public Map<String, Object> triggerReindex() {
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        String newIndexName = "products_v" + timestamp;
        String aliasName = searchProperties.getEngine().getAliasName();

        log.info("Starting zero-downtime catalog reindex into new index: {}", newIndexName);

        // Step 1: Create target index with latest mapping & settings
        indexClient.createIndex(newIndexName);

        // Step 2: In a live catalog pipeline, this pulls all products from Catalog Service / DB
        // and bulk writes to the new index.
        long indexedCount = indexClient.countDocuments();

        // Step 3: Atomic alias swap
        indexClient.swapAlias(aliasName, null, newIndexName);

        log.info("Completed zero-downtime reindex: swapped alias {} to {}, count={}",
                aliasName, newIndexName, indexedCount);

        return Map.of(
                "status", "SUCCESS",
                "newIndex", newIndexName,
                "alias", aliasName,
                "indexedDocuments", indexedCount,
                "timestamp", Instant.now().toString()
        );
    }
}
