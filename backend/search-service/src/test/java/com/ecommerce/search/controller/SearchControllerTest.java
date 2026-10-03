package com.ecommerce.search.controller;

import com.ecommerce.search.dto.*;
import com.ecommerce.search.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SearchController.class)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SearchService searchService;

    @Test
    void searchReturnsOkWithFacetsAndPagination() throws Exception {
        ProductSearchHitDto hit = ProductSearchHitDto.builder()
                .id("c1f76d20-8e10-48e2-9b2f-4a0b271e8c91")
                .title("Ergonomic Bamboo Wireless Mechanical Keyboard")
                .slug("ergonomic-bamboo-wireless-mechanical-keyboard")
                .price(new BigDecimal("11049.00"))
                .categoryName("Keyboards & Mice")
                .brand("AuraWorks")
                .averageRating(4.85)
                .stockStatus("IN_STOCK")
                .score(4.5)
                .build();

        FacetResultDto facets = FacetResultDto.builder()
                .categories(List.of(FacetBucketDto.builder().key("Keyboards & Mice").count(5).build()))
                .brands(List.of(FacetBucketDto.builder().key("AuraWorks").count(3).build()))
                .build();

        SearchResultDto result = SearchResultDto.builder()
                .content(List.of(hit))
                .facets(facets)
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1)
                .totalPages(1)
                .isFirst(true)
                .isLast(true)
                .build();

        when(searchService.search(any())).thenReturn(result);

        mockMvc.perform(get("/api/v1/search")
                        .param("q", "keyboard")
                        .param("page", "0")
                        .param("size", "20")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Ergonomic Bamboo Wireless Mechanical Keyboard"))
                .andExpect(jsonPath("$.facets.categories[0].key").value("Keyboards & Mice"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.isFirst").value(true));
    }

    @Test
    void searchValidationRejectsNegativePage() throws Exception {
        mockMvc.perform(get("/api/v1/search")
                        .param("page", "-1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details[0].field").value("page"));
    }
}
