package com.ecommerce.search.controller;

import com.ecommerce.search.dto.CategorySuggestionDto;
import com.ecommerce.search.dto.ProductSuggestionDto;
import com.ecommerce.search.dto.SuggestionResponseDto;
import com.ecommerce.search.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SuggestionController.class)
class SuggestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SearchService searchService;

    @Test
    void getSuggestionsReturnsMatchedProductsAndCategories() throws Exception {
        SuggestionResponseDto response = SuggestionResponseDto.builder()
                .query("key")
                .products(List.of(
                        ProductSuggestionDto.builder()
                                .id("prod-1")
                                .title("Ergonomic Bamboo Wireless Mechanical Keyboard")
                                .slug("ergonomic-bamboo-wireless-mechanical-keyboard")
                                .categoryName("Keyboards & Mice")
                                .price(new BigDecimal("11049.00"))
                                .build()
                ))
                .categories(List.of(
                        CategorySuggestionDto.builder()
                                .name("Keyboards & Mice")
                                .slug("keyboards-and-mice")
                                .build()
                ))
                .brands(List.of("AuraWorks"))
                .build();

        when(searchService.getSuggestions(anyString(), anyInt())).thenReturn(response);

        mockMvc.perform(get("/api/v1/search/suggestions")
                        .param("q", "key")
                        .param("limit", "5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("key"))
                .andExpect(jsonPath("$.products[0].title").value("Ergonomic Bamboo Wireless Mechanical Keyboard"))
                .andExpect(jsonPath("$.categories[0].name").value("Keyboards & Mice"))
                .andExpect(jsonPath("$.brands[0]").value("AuraWorks"));
    }
}
