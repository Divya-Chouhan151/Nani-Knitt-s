package com.ecommerce.search.controller;

import com.ecommerce.search.dto.SearchRequest;
import com.ecommerce.search.dto.SearchResultDto;
import com.ecommerce.search.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResultDto> search(@Valid @ModelAttribute SearchRequest request) {
        SearchResultDto result = searchService.search(request);
        return ResponseEntity.ok(result);
    }
}
