package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AddUpiPaymentMethodRequest;
import com.ecommerce.auth.dto.request.ValidateVpaRequest;
import com.ecommerce.auth.dto.response.PaymentMethodResponse;
import com.ecommerce.auth.dto.response.VpaValidationResponse;
import com.ecommerce.auth.entity.PaymentMethodType;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.UserPaymentMethod;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.UserPaymentMethodRepository;
import com.ecommerce.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentMethodServiceTest {

    @Mock
    private UserPaymentMethodRepository paymentMethodRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentGatewayService paymentGatewayService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PaymentMethodServiceImpl paymentMethodService;

    private User testUser;
    private final String userEmail = "rahul@example.com";
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(userId)
                .email(userEmail)
                .firstName("Rahul")
                .lastName("Sharma")
                .build();
    }

    @Test
    void validateVpa_whenValid_shouldReturnValidationResponse() {
        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(testUser));
        when(paymentGatewayService.validateVpa("rahul@okhdfcbank")).thenReturn(
                VpaValidationResponse.builder()
                        .vpa("rahul@okhdfcbank")
                        .isValid(true)
                        .accountHolderName("Rahul Sharma")
                        .bankName("HDFC Bank")
                        .gatewayReferenceId("tok_123")
                        .build()
        );

        VpaValidationResponse res = paymentMethodService.validateVpa(userEmail, new ValidateVpaRequest("rahul@okhdfcbank"));
        assertTrue(res.getIsValid());
        assertEquals("Rahul Sharma", res.getAccountHolderName());
        assertEquals("HDFC Bank", res.getBankName());
    }

    @Test
    void validateVpa_whenInvalidGatewayResponse_shouldThrowException() {
        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(testUser));
        when(paymentGatewayService.validateVpa("invalid@bank")).thenReturn(
                VpaValidationResponse.builder()
                        .vpa("invalid@bank")
                        .isValid(false)
                        .message("We couldn't verify this UPI ID. Please check and try again.")
                        .build()
        );

        Exception ex = assertThrows(IllegalArgumentException.class, () ->
                paymentMethodService.validateVpa(userEmail, new ValidateVpaRequest("invalid@bank")));
        assertTrue(ex.getMessage().contains("couldn't verify this UPI ID"));
    }

    @Test
    void addUpiPaymentMethod_whenValid_shouldSaveAndAuditLog() {
        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(testUser));
        when(paymentMethodRepository.existsByUserIdAndVpaIgnoreCaseAndDeletedFalse(userId, "rahul@okhdfcbank")).thenReturn(false);
        when(paymentGatewayService.validateVpa("rahul@okhdfcbank")).thenReturn(
                VpaValidationResponse.builder()
                        .vpa("rahul@okhdfcbank")
                        .isValid(true)
                        .accountHolderName("Rahul Sharma")
                        .bankName("HDFC Bank")
                        .gatewayReferenceId("tok_abc")
                        .build()
        );
        when(paymentMethodRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)).thenReturn(List.of());
        when(paymentMethodRepository.save(any(UserPaymentMethod.class))).thenAnswer(invocation -> {
            UserPaymentMethod m = invocation.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });

        PaymentMethodResponse res = paymentMethodService.addUpiPaymentMethod(userEmail,
                new AddUpiPaymentMethodRequest("rahul@okhdfcbank", true));

        assertNotNull(res);
        assertEquals("rahul@okhdfcbank", res.getVpa());
        assertEquals("rah***@okhdfcbank", res.getMaskedVpa());
        assertEquals("Rahul Sharma", res.getAccountHolderName());
        assertTrue(res.getIsDefault());
        assertTrue(res.getIsVerified());

        verify(auditService).logEvent(eq(userId), eq("PAYMENT_METHOD_ADDED"), eq("SUCCESS"), any(), any(), any());
    }

    @Test
    void addUpiPaymentMethod_whenDuplicateVpa_shouldThrowException() {
        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(testUser));
        when(paymentMethodRepository.existsByUserIdAndVpaIgnoreCaseAndDeletedFalse(userId, "rahul@okhdfcbank")).thenReturn(true);

        Exception ex = assertThrows(IllegalArgumentException.class, () ->
                paymentMethodService.addUpiPaymentMethod(userEmail, new AddUpiPaymentMethodRequest("rahul@okhdfcbank", false)));
        assertTrue(ex.getMessage().contains("already saved"));
    }

    @Test
    void setDefaultPaymentMethod_shouldResetOthersAndSetTarget() {
        UUID methodId = UUID.randomUUID();
        UserPaymentMethod method = UserPaymentMethod.builder()
                .id(methodId)
                .user(testUser)
                .type(PaymentMethodType.UPI)
                .vpa("priya@okaxis")
                .isDefault(false)
                .deleted(false)
                .build();

        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(testUser));
        when(paymentMethodRepository.findByIdAndUserIdAndDeletedFalse(methodId, userId)).thenReturn(Optional.of(method));
        when(paymentMethodRepository.save(any(UserPaymentMethod.class))).thenAnswer(i -> i.getArgument(0));

        PaymentMethodResponse res = paymentMethodService.setDefaultPaymentMethod(userEmail, methodId);
        assertTrue(res.getIsDefault());

        verify(paymentMethodRepository).resetDefaultPaymentMethod(userId);
        verify(auditService).logEvent(eq(userId), eq("PAYMENT_METHOD_DEFAULT_CHANGED"), eq("SUCCESS"), any(), any(), any());
    }

    @Test
    void deletePaymentMethod_shouldSoftDeleteAndReassignDefaultIfNeeded() {
        UUID methodId = UUID.randomUUID();
        UserPaymentMethod method = UserPaymentMethod.builder()
                .id(methodId)
                .user(testUser)
                .type(PaymentMethodType.UPI)
                .vpa("primary@okhdfcbank")
                .isDefault(true)
                .deleted(false)
                .build();

        UUID remainingId = UUID.randomUUID();
        UserPaymentMethod remainingMethod = UserPaymentMethod.builder()
                .id(remainingId)
                .user(testUser)
                .type(PaymentMethodType.UPI)
                .vpa("secondary@okaxis")
                .isDefault(false)
                .deleted(false)
                .build();

        when(userRepository.findByEmailIgnoreCase(userEmail)).thenReturn(Optional.of(testUser));
        when(paymentMethodRepository.findByIdAndUserIdAndDeletedFalse(methodId, userId)).thenReturn(Optional.of(method));
        when(paymentMethodRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(remainingMethod));

        paymentMethodService.deletePaymentMethod(userEmail, methodId);

        assertTrue(method.getDeleted());
        assertFalse(method.getIsDefault());
        assertTrue(remainingMethod.getIsDefault());

        verify(paymentMethodRepository).save(method);
        verify(paymentMethodRepository).save(remainingMethod);
        verify(auditService).logEvent(eq(userId), eq("PAYMENT_METHOD_REMOVED"), eq("SUCCESS"), any(), any(), any());
    }

    @Test
    void ownershipCheck_whenUnknownUser_shouldThrowException() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () ->
                paymentMethodService.getPaymentMethods("unknown@example.com"));
    }
}
