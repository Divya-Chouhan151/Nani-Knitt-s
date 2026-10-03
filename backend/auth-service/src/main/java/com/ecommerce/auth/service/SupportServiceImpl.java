package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.CreateTicketRequest;
import com.ecommerce.auth.dto.response.SupportFaqDto;
import com.ecommerce.auth.dto.response.SupportTicketDetailDto;
import com.ecommerce.auth.dto.response.SupportTicketDto;
import com.ecommerce.auth.dto.response.SupportTicketMessageDto;
import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportServiceImpl implements SupportService {

    private final SupportFaqRepository faqRepository;
    private final SupportTicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<SupportFaqDto> getFaqs(String category) {
        List<SupportFaq> faqs;
        if (category != null && !category.isBlank()) {
            faqs = faqRepository.findByCategoryOrderByDisplayOrderAsc(category.trim());
        } else {
            faqs = faqRepository.findAllByOrderByDisplayOrderAsc();
        }

        return faqs.stream().map(f -> SupportFaqDto.builder()
                .id(f.getId())
                .category(f.getCategory())
                .question(f.getQuestion())
                .answer(f.getAnswer())
                .displayOrder(f.getDisplayOrder())
                .build()).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportTicketDto createTicket(String email, CreateTicketRequest request) {
        User user = getUser(email);

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findByIdAndUserId(request.getOrderId(), user.getId()).orElse(null);
        }

        String ticketNumber = "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .user(user)
                .order(order)
                .category(request.getCategory().trim())
                .subject(request.getSubject().trim())
                .status("OPEN")
                .priority("MEDIUM")
                .messages(new ArrayList<>())
                .build();

        SupportTicketMessage initialMsg = SupportTicketMessage.builder()
                .ticket(ticket)
                .senderType("CUSTOMER")
                .message(request.getMessage().trim())
                .attachmentUrl(request.getAttachmentUrl())
                .build();

        ticket.getMessages().add(initialMsg);
        SupportTicket saved = ticketRepository.save(ticket);

        auditService.logEvent(user.getId(), "SUPPORT_TICKET_CREATED", "SUCCESS", null, null,
                "Created support ticket: " + ticketNumber);

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketDto> getUserTickets(String email) {
        User user = getUser(email);
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketDetailDto getTicketDetail(String email, UUID ticketId) {
        User user = getUser(email);
        SupportTicket ticket = ticketRepository.findByIdAndUserId(ticketId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        List<SupportTicketMessageDto> messageDtos = ticket.getMessages().stream()
                .map(m -> SupportTicketMessageDto.builder()
                        .id(m.getId())
                        .senderType(m.getSenderType())
                        .message(m.getMessage())
                        .attachmentUrl(m.getAttachmentUrl())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SupportTicketDetailDto.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .orderId(ticket.getOrder() != null ? ticket.getOrder().getId() : null)
                .category(ticket.getCategory())
                .subject(ticket.getSubject())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .messages(messageDtos)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public SupportTicketMessageDto addReply(String email, UUID ticketId, String message, String attachmentUrl) {
        User user = getUser(email);
        SupportTicket ticket = ticketRepository.findByIdAndUserId(ticketId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        SupportTicketMessage reply = SupportTicketMessage.builder()
                .ticket(ticket)
                .senderType("CUSTOMER")
                .message(message.trim())
                .attachmentUrl(attachmentUrl)
                .build();

        ticket.getMessages().add(reply);
        ticketRepository.save(ticket);

        return SupportTicketMessageDto.builder()
                .id(reply.getId())
                .senderType(reply.getSenderType())
                .message(reply.getMessage())
                .attachmentUrl(reply.getAttachmentUrl())
                .createdAt(reply.getCreatedAt())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private SupportTicketDto mapToDto(SupportTicket t) {
        return SupportTicketDto.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .orderId(t.getOrder() != null ? t.getOrder().getId() : null)
                .category(t.getCategory())
                .subject(t.getSubject())
                .status(t.getStatus())
                .priority(t.getPriority())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
