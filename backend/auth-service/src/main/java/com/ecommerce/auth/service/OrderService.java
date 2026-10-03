package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.CreateReturnRequest;
import com.ecommerce.auth.dto.response.OrderDetailDto;
import com.ecommerce.auth.dto.response.OrderSummaryDto;
import com.ecommerce.auth.dto.response.ReturnRequestResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface OrderService {
    Page<OrderSummaryDto> getOrders(String email, String status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    OrderDetailDto getOrderDetail(String email, UUID orderId);
    void cancelOrder(String email, UUID orderId, String reason);
    ReturnRequestResponse initiateReturn(String email, UUID orderId, CreateReturnRequest request);
}
