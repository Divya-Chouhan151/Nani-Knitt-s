package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.CancelOrderRequest;
import com.ecommerce.auth.dto.request.CreateReturnRequest;
import com.ecommerce.auth.dto.response.OrderDetailDto;
import com.ecommerce.auth.dto.response.OrderSummaryDto;
import com.ecommerce.auth.dto.response.ReturnRequestResponse;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderSummaryDto>> getOrders(
            Principal principal,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(orderService.getOrders(email, status, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailDto> getOrderDetail(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(orderService.getOrderDetail(email, id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrder(
            Principal principal,
            @PathVariable("id") UUID id,
            @Valid @RequestBody CancelOrderRequest request) {
        String email = getAuthenticatedEmail(principal);
        orderService.cancelOrder(email, id, request.getReason());
        return ResponseEntity.ok(Map.of("message", "Order successfully cancelled"));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ReturnRequestResponse> initiateReturn(
            Principal principal,
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateReturnRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(orderService.initiateReturn(email, id, request));
    }

    private String getAuthenticatedEmail(Principal principal) {
        if (principal != null) {
            return principal.getName();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        throw new InvalidCredentialsException("Authentication required");
    }
}
