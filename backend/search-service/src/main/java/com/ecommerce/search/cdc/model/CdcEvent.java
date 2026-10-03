package com.ecommerce.search.cdc.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CdcEvent<T> {

    /**
     * Operation type:
     * 'c' = create
     * 'u' = update
     * 'd' = delete
     * 'r' = read / snapshot
     */
    private String op;

    @JsonProperty("ts_ms")
    private Long tsMs;

    private T before;

    private T after;
}
