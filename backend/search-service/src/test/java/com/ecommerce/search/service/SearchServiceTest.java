package com.ecommerce.search.service;

import com.ecommerce.search.config.SearchProperties;
import com.ecommerce.search.domain.ProductSearchDocument;
import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.dto.SuggestionResponseDto;
import com.ecommerce.search.engine.InMemorySearchIndexClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SearchServiceTest {

    private InMemorySearchIndexClient indexClient;
    private SearchServiceImpl searchService;

    @BeforeEach
    void setUp() {
        indexClient = new InMemorySearchIndexClient();
        indexClient.clear();
        SearchProperties properties = new SearchProperties();
        searchService = new SearchServiceImpl(indexClient, properties);

        // Seed with test documents
        indexClient.indexDocument(ProductSearchDocument.builder()
                .id("1")
                .title("Ergonomic Bamboo Wireless Mechanical Keyboard")
                .slug("ergonomic-bamboo-keyboard")
                .categoryName("Keyboards & Mice")
                .categorySlug("keyboards-and-mice")
                .brand("AuraWorks")
                .price(new BigDecimal("100.00"))
                .averageRating(4.9)
                .stockQuantity(10)
                .stockStatus("IN_STOCK")
                .isActive(true)
                .suggest(List.of("keyboard", "wireless keyboard", "mechanical keyboard"))
                .build());

        indexClient.indexDocument(ProductSearchDocument.builder()
                .id("2")
                .title("Budget Membrane Keyboard")
                .slug("budget-membrane-keyboard")
                .categoryName("Keyboards & Mice")
                .categorySlug("keyboards-and-mice")
                .brand("BasicBrand")
                .price(new BigDecimal("25.00"))
                .averageRating(4.1)
                .stockQuantity(50)
                .stockStatus("IN_STOCK")
                .isActive(true)
                .suggest(List.of("keyboard", "budget keyboard"))
                .build());

        indexClient.indexDocument(ProductSearchDocument.builder()
                .id("3")
                .title("Aura Gaming Mouse")
                .slug("aura-gaming-mouse")
                .categoryName("Mice")
                .categorySlug("mice")
                .brand("AuraWorks")
                .price(new BigDecimal("60.00"))
                .averageRating(4.7)
                .stockQuantity(0)
                .stockStatus("OUT_OF_STOCK")
                .isActive(true)
                .suggest(List.of("mouse", "gaming mouse"))
                .build());
    }

    @Test
    void searchReturnsRankedMatches() {
        SearchRequest request = SearchRequest.builder()
                .q("keyboard")
                .sort("relevance")
                .build();

        SearchResultDto result = searchService.search(request);

        assertThat(result.getContent()).hasSize(2);
        // The first match should have higher score due to rating and title matching
        assertThat(result.getContent().get(0).getTitle()).contains("Ergonomic Bamboo Wireless Mechanical Keyboard");
    }

    @Test
    void spellingCorrectionSuggestsExpectedQuery() {
        SearchRequest request = SearchRequest.builder()
                .q("keybord") // typo
                .build();

        SearchResultDto result = searchService.search(request);
        assertThat(result.getDidYouMean()).isEqualTo("keyboard");
    }

    @Test
    void facetFilteringByBrandRestrictsResults() {
        SearchRequest request = SearchRequest.builder()
                .brand("BasicBrand")
                .build();

        SearchResultDto result = searchService.search(request);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getBrand()).isEqualTo("BasicBrand");
    }

    @Test
    void inStockOnlyFilterExcludesOutOfStock() {
        SearchRequest request = SearchRequest.builder()
                .inStockOnly(true)
                .build();

        SearchResultDto result = searchService.search(request);
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(p -> !"OUT_OF_STOCK".equals(p.getStockStatus()));
    }

    @Test
    void sortPriceAscendingOrdersCorrectly() {
        SearchRequest request = SearchRequest.builder()
                .sort("price_asc")
                .build();

        SearchResultDto result = searchService.search(request);
        assertThat(result.getContent().get(0).getPrice()).isEqualByComparingTo("25.00");
        assertThat(result.getContent().get(1).getPrice()).isEqualByComparingTo("60.00");
        assertThat(result.getContent().get(2).getPrice()).isEqualByComparingTo("100.00");
    }

    @Test
    void suggestionsReturnPrefixMatches() {
        SuggestionResponseDto response = searchService.getSuggestions("key", 5);
        assertThat(response.getProducts()).isNotEmpty();
        assertThat(response.getCategories()).isNotEmpty();
    }
}
