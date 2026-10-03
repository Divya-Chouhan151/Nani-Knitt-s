package com.ecommerce.search.controller;

import com.ecommerce.search.service.CatalogBackfillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/search/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchAdminController {

    private final CatalogBackfillService backfillService;

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindex() {
        Map<String, Object> result = backfillService.triggerReindex();
        return ResponseEntity.ok(result);
    }
}
