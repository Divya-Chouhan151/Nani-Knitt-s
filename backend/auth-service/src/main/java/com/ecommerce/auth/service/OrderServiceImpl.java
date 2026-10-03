package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.CreateReturnRequest;
import com.ecommerce.auth.dto.response.*;
import com.ecommerce.auth.entity.*;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryDto> getOrders(String email, String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        User user = getUser(email);

        Page<Order> orders;
        if (status != null && !status.isBlank()) {
            orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), status.trim().toUpperCase(), pageable);
        } else if (startDate != null && endDate != null) {
            Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            orders = orderRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(user.getId(), start, end, pageable);
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        }

        return orders.map(this::mapToSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailDto getOrderDetail(String email, UUID orderId) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        return mapToDetail(order);
    }

    @Override
    @Transactional
    public void cancelOrder(String email, UUID orderId, String reason) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!"PLACED".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new IllegalStateException("Order in status '" + order.getStatus() + "' cannot be cancelled. Only unfulfilled orders can be cancelled.");
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status("CANCELLED")
                .notes("Customer cancelled: " + reason)
                .build();
        statusHistoryRepository.save(history);

        auditService.logEvent(user.getId(), "ORDER_CANCELLED", "SUCCESS", null, null,
                "Cancelled order " + order.getOrderNumber() + " with reason: " + reason);
    }

    @Override
    @Transactional
    public ReturnRequestResponse initiateReturn(String email, UUID orderId, CreateReturnRequest request) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!"DELIVERED".equals(order.getStatus())) {
            throw new IllegalStateException("Returns can only be requested for delivered orders");
        }

        if (returnRequestRepository.findByOrderId(order.getId()).isPresent()) {
            throw new IllegalStateException("A return request has already been filed for this order");
        }

        order.setStatus("RETURN_REQUESTED");
        orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status("RETURN_REQUESTED")
                .notes("Return initiated: " + request.getReason())
                .build();
        statusHistoryRepository.save(history);

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .user(user)
                .reason(request.getReason())
                .status("PENDING_APPROVAL")
                .build();

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        auditService.logEvent(user.getId(), "ORDER_RETURN_REQUESTED", "SUCCESS", null, null,
                "Requested return for order " + order.getOrderNumber() + ": " + request.getReason());

        return ReturnRequestResponse.builder()
                .id(saved.getId())
                .orderId(order.getId())
                .reason(saved.getReason())
                .status(saved.getStatus())
                .requestedAt(saved.getRequestedAt())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private OrderSummaryDto mapToSummary(Order o) {
        int count = o.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
        String firstTitle = o.getItems().isEmpty() ? "Order Item" : o.getItems().get(0).getProductTitle();
        String firstImage = o.getItems().isEmpty() ? null : o.getItems().get(0).getImageUrl();

        return OrderSummaryDto.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .currency(o.getCurrency())
                .totalAmount(o.getTotalAmount())
                .itemCount(count)
                .firstItemTitle(firstTitle)
                .firstItemImageUrl(firstImage)
                .estimatedDelivery(o.getEstimatedDelivery())
                .createdAt(o.getCreatedAt())
                .build();
    }

    private OrderDetailDto mapToDetail(Order o) {
        List<OrderItemDto> itemDtos = o.getItems().stream().map(i -> OrderItemDto.builder()
                .id(i.getId())
                .productId(i.getProductId())
                .sku(i.getSku())
                .productTitle(i.getProductTitle())
                .unitPrice(i.getUnitPrice())
                .quantity(i.getQuantity())
                .totalPrice(i.getTotalPrice())
                .imageUrl(i.getImageUrl())
                .build()).collect(Collectors.toList());

        List<OrderStatusHistoryDto> historyDtos = o.getStatusHistory().stream().map(h -> OrderStatusHistoryDto.builder()
                .id(h.getId())
                .status(h.getStatus())
                .notes(h.getNotes())
                .createdAt(h.getCreatedAt())
                .build()).collect(Collectors.toList());

        boolean canCancel = "PLACED".equals(o.getStatus()) || "CONFIRMED".equals(o.getStatus());
        boolean canReturn = "DELIVERED".equals(o.getStatus()) && returnRequestRepository.findByOrderId(o.getId()).isEmpty();

        return OrderDetailDto.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .currency(o.getCurrency())
                .subtotalAmount(o.getSubtotalAmount())
                .taxAmount(o.getTaxAmount())
                .shippingAmount(o.getShippingAmount())
                .totalAmount(o.getTotalAmount())
                .shippingAddress(o.getShippingAddress())
                .paymentStatus(o.getPaymentStatus())
                .trackingCarrier(o.getTrackingCarrier())
                .trackingNumber(o.getTrackingNumber())
                .estimatedDelivery(o.getEstimatedDelivery())
                .items(itemDtos)
                .statusHistory(historyDtos)
                .canCancel(canCancel)
                .canReturn(canReturn)
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
