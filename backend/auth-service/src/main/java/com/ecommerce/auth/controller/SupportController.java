package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.CreateTicketRequest;
import com.ecommerce.auth.dto.response.SupportFaqDto;
import com.ecommerce.auth.dto.response.SupportTicketDetailDto;
import com.ecommerce.auth.dto.response.SupportTicketDto;
import com.ecommerce.auth.dto.response.SupportTicketMessageDto;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupportController {

    private final SupportService supportService;

    @GetMapping("/faqs")
    public ResponseEntity<List<SupportFaqDto>> getFaqs(
            @RequestParam(name = "category", required = false) String category) {
        return ResponseEntity.ok(supportService.getFaqs(category));
    }

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicketDto> createTicket(
            Principal principal,
            @Valid @RequestBody CreateTicketRequest request) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(supportService.createTicket(email, request));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketDto>> getTickets(Principal principal) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(supportService.getUserTickets(email));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<SupportTicketDetailDto> getTicketDetail(
            Principal principal,
            @PathVariable("id") UUID id) {
        String email = getAuthenticatedEmail(principal);
        return ResponseEntity.ok(supportService.getTicketDetail(email, id));
    }

    @PostMapping("/tickets/{id}/reply")
    public ResponseEntity<SupportTicketMessageDto> addReply(
            Principal principal,
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> body) {
        String email = getAuthenticatedEmail(principal);
        String message = body.getOrDefault("message", "");
        String attachmentUrl = body.get("attachmentUrl");
        return ResponseEntity.ok(supportService.addReply(email, id, message, attachmentUrl));
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
