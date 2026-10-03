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
public class SuggestionResponseDto {

    private String query;

    @Builder.Default
    private List<ProductSuggestionDto> products = new ArrayList<>();

    @Builder.Default
    private List<CategorySuggestionDto> categories = new ArrayList<>();

    @Builder.Default
    private List<String> brands = new ArrayList<>();
}
