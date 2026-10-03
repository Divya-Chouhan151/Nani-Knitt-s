package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.request.CancelOrderRequest;
import com.ecommerce.auth.dto.request.CreateReturnRequest;
import com.ecommerce.auth.dto.response.OrderDetailDto;
import com.ecommerce.auth.dto.response.OrderSummaryDto;
import com.ecommerce.auth.dto.response.ReturnRequestResponse;
import com.ecommerce.auth.security.JwtAuthFilter;
import com.ecommerce.auth.security.JwtProvider;
import com.ecommerce.auth.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "user@aura.com")
    void getOrders_shouldReturnPage() throws Exception {
        OrderSummaryDto summary = OrderSummaryDto.builder()
                .id(UUID.randomUUID())
                .orderNumber("ORD-12345")
                .status("PROCESSING")
                .totalAmount(BigDecimal.valueOf(1499.00))
                .itemCount(2)
                .build();

        when(orderService.getOrders(eq("user@aura.com"), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(summary)));

        mockMvc.perform(get("/api/v1/profile/orders")
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].orderNumber").value("ORD-12345"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void getOrderDetail_shouldReturnDetail() throws Exception {
        UUID orderId = UUID.randomUUID();
        OrderDetailDto detail = OrderDetailDto.builder()
                .id(orderId)
                .orderNumber("ORD-12345")
                .status("SHIPPED")
                .trackingCarrier("BlueDart")
                .trackingNumber("BD987654321")
                .canCancel(false)
                .canReturn(false)
                .build();

        when(orderService.getOrderDetail(eq("user@aura.com"), eq(orderId))).thenReturn(detail);

        mockMvc.perform(get("/api/v1/profile/orders/{id}", orderId)
                        .principal(() -> "user@aura.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingNumber").value("BD987654321"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void cancelOrder_shouldReturnOk() throws Exception {
        UUID orderId = UUID.randomUUID();
        CancelOrderRequest req = new CancelOrderRequest("Placed by mistake");

        mockMvc.perform(post("/api/v1/profile/orders/{id}/cancel", orderId)
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        verify(orderService).cancelOrder(eq("user@aura.com"), eq(orderId), eq("Placed by mistake"));
    }

    @Test
    @WithMockUser(username = "user@aura.com")
    void initiateReturn_shouldReturnOk() throws Exception {
        UUID orderId = UUID.randomUUID();
        CreateReturnRequest req = new CreateReturnRequest("Defective product");

        ReturnRequestResponse resp = ReturnRequestResponse.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .reason("Defective product")
                .status("PENDING_APPROVAL")
                .build();

        when(orderService.initiateReturn(eq("user@aura.com"), eq(orderId), any(CreateReturnRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/api/v1/profile/orders/{id}/return", orderId)
                        .principal(() -> "user@aura.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));
    }
}
