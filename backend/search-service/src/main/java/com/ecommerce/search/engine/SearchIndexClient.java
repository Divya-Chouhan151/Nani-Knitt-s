package com.ecommerce.search.engine;

import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.domain.ProductSearchDocument;
import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.dto.SuggestionResponseDto;

public interface SearchIndexClient {

    void indexDocument(ProductSearchDocument doc);

    void deleteDocument(String id);

    ProductSearchDocument getDocument(String id);

    SearchResultDto search(SearchRequest request, SearchProperties.Ranking ranking);

    SuggestionResponseDto suggest(String query, int limit);

    void createIndex(String indexName);

    void swapAlias(String aliasName, String oldIndex, String newIndex);

    long countDocuments();

    void clear();

    boolean isHealthy();
}
