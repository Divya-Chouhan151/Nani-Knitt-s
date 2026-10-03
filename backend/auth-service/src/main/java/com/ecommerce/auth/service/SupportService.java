package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.CreateTicketRequest;
import com.ecommerce.auth.dto.response.SupportFaqDto;
import com.ecommerce.auth.dto.response.SupportTicketDetailDto;
import com.ecommerce.auth.dto.response.SupportTicketDto;
import com.ecommerce.auth.dto.response.SupportTicketMessageDto;

import java.util.List;
import java.util.UUID;

public interface SupportService {
    List<SupportFaqDto> getFaqs(String category);
    SupportTicketDto createTicket(String email, CreateTicketRequest request);
    List<SupportTicketDto> getUserTickets(String email);
    SupportTicketDetailDto getTicketDetail(String email, UUID ticketId);
    SupportTicketMessageDto addReply(String email, UUID ticketId, String message, String attachmentUrl);
}
