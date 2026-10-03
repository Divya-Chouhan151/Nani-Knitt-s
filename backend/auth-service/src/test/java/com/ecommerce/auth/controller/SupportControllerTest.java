package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.CreateTicketRequest;
import com.ecommerce.auth.dto.response.SupportFaqDto;
import com.ecommerce.auth.dto.response.SupportTicketDetailDto;
import com.ecommerce.auth.dto.response.SupportTicketDto;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.SupportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SupportController.class)
@AutoConfigureMockMvc(addFilters = false)
class SupportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SupportService supportService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    void getFaqs_shouldReturnList() throws Exception {
        SupportFaqDto faq = SupportFaqDto.builder()
                .id(UUID.randomUUID())
                .category("Orders")
                .question("Where is my order?")
                .answer("Check the Orders tab.")
                .displayOrder(1)
                .build();

        when(supportService.getFaqs(any())).thenReturn(List.of(faq));

        mockMvc.perform(get("/api/v1/support/faqs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Orders"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void createTicket_shouldReturnCreated() throws Exception {
        CreateTicketRequest req = CreateTicketRequest.builder()
                .category("Delivery")
                .subject("Late package")
                .message("My package is delayed by 3 days")
                .build();

        SupportTicketDto resp = SupportTicketDto.builder()
                .id(UUID.randomUUID())
                .ticketNumber("TCK-99001")
                .category("Delivery")
                .subject("Late package")
                .status("OPEN")
                .build();

        when(supportService.createTicket(eq("user@aura.com"), any(CreateTicketRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/v1/support/tickets")
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketNumber").value("TCK-99001"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void getTickets_shouldReturnList() throws Exception {
        SupportTicketDto resp = SupportTicketDto.builder()
                .id(UUID.randomUUID())
                .ticketNumber("TCK-99001")
                .subject("Late package")
                .status("OPEN")
                .build();

        when(supportService.getUserTickets(eq("user@aura.com"))).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/v1/support/tickets")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticketNumber").value("TCK-99001"));
    }
}
