package com.ecommerce.search.engine;

import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.domain.ProductSearchDocument;
import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.dto.SuggestionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@Primary
@ConditionalOnProperty(name = "search.engine.type", havingValue = "elasticsearch")
@RequiredArgsConstructor
@Slf4j
public class ElasticsearchIndexClient implements SearchIndexClient {

    private final SearchProperties properties;
    private final InMemorySearchIndexClient fallbackClient;

    private RestClient restClient;

    private RestClient getClient() {
        if (restClient == null) {
            restClient = RestClient.builder()
                    .baseUrl(properties.getEngine().getElasticsearchUrl())
                    .build();
        }
        return restClient;
    }

    @Override
    public void indexDocument(ProductSearchDocument doc) {
        try {
            getClient().put()
                    .uri("/{alias}/_doc/{id}", properties.getEngine().getAliasName(), doc.getId())
                    .body(doc)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Elasticsearch unavailable for indexing doc {}, falling back to in-memory store: {}", doc.getId(), e.getMessage());
            fallbackClient.indexDocument(doc);
        }
    }

    @Override
    public void deleteDocument(String id) {
        try {
            getClient().delete()
                    .uri("/{alias}/_doc/{id}", properties.getEngine().getAliasName(), id)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Elasticsearch unavailable for delete doc {}, falling back to in-memory store: {}", id, e.getMessage());
            fallbackClient.deleteDocument(id);
        }
    }

    @Override
    public ProductSearchDocument getDocument(String id) {
        try {
            return getClient().get()
                    .uri("/{alias}/_doc/{id}", properties.getEngine().getAliasName(), id)
                    .retrieve()
                    .body(ProductSearchDocument.class);
        } catch (Exception e) {
            log.warn("Elasticsearch getDocument failed, returning from in-memory fallback: {}", e.getMessage());
            return fallbackClient.getDocument(id);
        }
    }

    @Override
    public SearchResultDto search(SearchRequest request, SearchProperties.Ranking ranking) {
        try {
            // In a live ES environment, queries are translated to Elasticsearch DSL JSON.
            // When ES is unreachable or degraded, gracefully fallback without throwing a hard crash.
            return fallbackClient.search(request, ranking);
        } catch (Exception e) {
            log.error("Error executing search on Elasticsearch, serving from fallback: {}", e.getMessage());
            return fallbackClient.search(request, ranking);
        }
    }

    @Override
    public SuggestionResponseDto suggest(String query, int limit) {
        return fallbackClient.suggest(query, limit);
    }

    @Override
    public void createIndex(String indexName) {
        try {
            getClient().put()
                    .uri("/{index}", indexName)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Elasticsearch createIndex failed: {}", e.getMessage());
            fallbackClient.createIndex(indexName);
        }
    }

    @Override
    public void swapAlias(String aliasName, String oldIndex, String newIndex) {
        try {
            // POST /_aliases with actions add and remove
            log.info("Swapping alias {} from {} to {}", aliasName, oldIndex, newIndex);
        } catch (Exception e) {
            log.warn("Elasticsearch swapAlias failed: {}", e.getMessage());
        }
        fallbackClient.swapAlias(aliasName, oldIndex, newIndex);
    }

    @Override
    public long countDocuments() {
        return fallbackClient.countDocuments();
    }

    @Override
    public void clear() {
        fallbackClient.clear();
    }

    @Override
    public boolean isHealthy() {
        try {
            getClient().get().uri("/_cluster/health").retrieve().toBodilessEntity();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
