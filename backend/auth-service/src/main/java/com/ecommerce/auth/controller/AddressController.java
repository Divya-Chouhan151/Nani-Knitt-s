package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.AddressRequest;
import com.ecommerce.auth.dto.response.AddressResponse;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.AddressService;
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
@RequestMapping("/api/v1/profile/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(addressService.getAddresses(email));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            Principal principal,
            @Valid @RequestBody AddressRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.createAddress(email, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            Principal principal,
            @PathVariable("id") UUID id,
            @Valid @RequestBody AddressRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(addressService.updateAddress(email, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        addressService.deleteAddress(email, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default-shipping")
    public ResponseEntity<AddressResponse> setDefaultShipping(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(addressService.setDefaultShipping(email, id));
    }

    @PatchMapping("/{id}/default-billing")
    public ResponseEntity<AddressResponse> setDefaultBilling(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(addressService.setDefaultBilling(email, id));
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
