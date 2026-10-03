package com.ecommerce.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {

    @Builder.Default
    private List<ProductSearchHitDto> content = new ArrayList<>();

    private FacetResultDto facets;

    private String didYouMean;

    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;

    @com.fasterxml.jackson.annotation.JsonProperty("isFirst")
    private boolean isFirst;

    @com.fasterxml.jackson.annotation.JsonProperty("isLast")
    private boolean isLast;

    private boolean hasNext;
    private boolean hasPrevious;
}
