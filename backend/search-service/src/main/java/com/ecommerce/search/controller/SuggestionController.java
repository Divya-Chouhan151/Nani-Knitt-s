package com.ecommerce.search.controller;

import com.ecommerce.search.dto.SuggestionResponseDto;
import com.ecommerce.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search/suggestions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SuggestionController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SuggestionResponseDto> getSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "8") int limit) {
        SuggestionResponseDto suggestions = searchService.getSuggestions(query, limit);
        return ResponseEntity.ok(suggestions);
    }
}
