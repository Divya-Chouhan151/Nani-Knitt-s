package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.AddUpiPaymentMethodRequest;
import com.ecommerce.auth.dto.request.ValidateVpaRequest;
import com.ecommerce.auth.dto.response.PaymentMethodResponse;
import com.ecommerce.auth.dto.response.VpaValidationResponse;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.PaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/payment-methods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<List<PaymentMethodResponse>> getPaymentMethods(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(paymentMethodService.getPaymentMethods(email));
    }

    @PostMapping("/validate-vpa")
    public ResponseEntity<VpaValidationResponse> validateVpa(
            Principal principal,
            @Valid @RequestBody ValidateVpaRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(paymentMethodService.validateVpa(email, request));
    }

    @PostMapping("/upi")
    public ResponseEntity<PaymentMethodResponse> addUpiPaymentMethod(
            Principal principal,
            @Valid @RequestBody AddUpiPaymentMethodRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentMethodService.addUpiPaymentMethod(email, request));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<PaymentMethodResponse> setDefaultPaymentMethod(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(paymentMethodService.setDefaultPaymentMethod(email, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        paymentMethodService.deletePaymentMethod(email, id);
        return ResponseEntity.noContent().build();
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
