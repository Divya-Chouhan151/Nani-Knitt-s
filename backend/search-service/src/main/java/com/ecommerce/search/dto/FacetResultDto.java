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
public class FacetResultDto {

    @Builder.Default
    private List<FacetBucketDto> categories = new ArrayList<>();

    @Builder.Default
    private List<FacetBucketDto> brands = new ArrayList<>();

    @Builder.Default
    private List<RangeFacetBucketDto> priceRanges = new ArrayList<>();

    @Builder.Default
    private List<RangeFacetBucketDto> ratings = new ArrayList<>();

    @Builder.Default
    private List<FacetBucketDto> stockStatuses = new ArrayList<>();
}
