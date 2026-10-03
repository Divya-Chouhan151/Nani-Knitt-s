package com.ecommerce.search.service;

import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.dto.SuggestionResponseDto;

public interface SearchService {

    SearchResultDto search(SearchRequest request);

    SuggestionResponseDto getSuggestions(String query, int limit);
}
