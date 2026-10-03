package com.ecommerce.search.service;

import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.dto.SuggestionResponseDto;
import com.ecommerce.search.engine.SearchIndexClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchServiceImpl implements SearchService {

    private final SearchIndexClient indexClient;
    private final SearchProperties searchProperties;

    @Override
    public SearchResultDto search(SearchRequest request) {
        long startTime = System.currentTimeMillis();
        SearchResultDto result = indexClient.search(request, searchProperties.getRanking());
        long duration = System.currentTimeMillis() - startTime;

        log.debug("Search query='{}', category='{}', brand='{}' executed in {}ms, totalHits={}",
                request.getQ(), request.getCategory(), request.getBrand(), duration, result.getTotalElements());

        // Zero-results observability logging
        if (result.getTotalElements() == 0 && request.getQ() != null && !request.getQ().isBlank()) {
            log.info("Zero search results encountered for query='{}'", request.getQ());
        }

        return result;
    }

    @Override
    public SuggestionResponseDto getSuggestions(String query, int limit) {
        long startTime = System.currentTimeMillis();
        SuggestionResponseDto suggestions = indexClient.suggest(query, limit);
        long duration = System.currentTimeMillis() - startTime;

        log.debug("Suggestions for query='{}' returned {} products in {}ms",
                query, suggestions.getProducts().size(), duration);

        return suggestions;
    }
}
