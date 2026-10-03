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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private final UserPaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;
    private final PaymentGatewayService paymentGatewayService;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getPaymentMethods(String email) {
        User user = getUser(email);
        return paymentMethodRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VpaValidationResponse validateVpa(String email, ValidateVpaRequest request) {
        getUser(email); // Ensure valid session
        VpaValidationResponse response = paymentGatewayService.validateVpa(request.getVpa());
        if (!Boolean.TRUE.equals(response.getIsValid())) {
            throw new IllegalArgumentException(response.getMessage() != null
                    ? response.getMessage()
                    : "We couldn't verify this UPI ID. Please check and try again.");
        }
        return response;
    }

    @Override
    @Transactional
    public PaymentMethodResponse addUpiPaymentMethod(String email, AddUpiPaymentMethodRequest request) {
        User user = getUser(email);
        String vpa = request.getVpa().trim().toLowerCase(Locale.ROOT);

        if (paymentMethodRepository.existsByUserIdAndVpaIgnoreCaseAndDeletedFalse(user.getId(), vpa)) {
            throw new IllegalArgumentException("This UPI ID is already saved in your account");
        }

        // Validate via gateway before saving - do not save unverified VPAs
        VpaValidationResponse validation = paymentGatewayService.validateVpa(vpa);
        if (!Boolean.TRUE.equals(validation.getIsValid())) {
            throw new IllegalArgumentException(validation.getMessage() != null
                    ? validation.getMessage()
                    : "We couldn't verify this UPI ID. Please check and try again.");
        }

        List<UserPaymentMethod> existingMethods = paymentMethodRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId());

        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault()) || existingMethods.isEmpty();
        if (shouldBeDefault) {
            paymentMethodRepository.resetDefaultPaymentMethod(user.getId());
        }

        UserPaymentMethod method = UserPaymentMethod.builder()
                .user(user)
                .type(PaymentMethodType.UPI)
                .vpa(vpa)
                .accountHolderName(validation.getAccountHolderName())
                .bankName(validation.getBankName())
                .isVerified(true)
                .isDefault(shouldBeDefault)
                .gatewayReferenceId(validation.getGatewayReferenceId())
                .deleted(false)
                .build();

        UserPaymentMethod saved = paymentMethodRepository.save(method);
        String masked = maskVpa(vpa);
        auditService.logEvent(user.getId(), "PAYMENT_METHOD_ADDED", "SUCCESS", null, null,
                "Added UPI payment method: " + masked);

        log.info("Saved new UPI payment method for user {}: {}", user.getId(), masked);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PaymentMethodResponse setDefaultPaymentMethod(String email, UUID paymentMethodId) {
        User user = getUser(email);
        UserPaymentMethod method = getPaymentMethod(user.getId(), paymentMethodId);

        paymentMethodRepository.resetDefaultPaymentMethod(user.getId());
        method.setIsDefault(true);
        UserPaymentMethod updated = paymentMethodRepository.save(method);

        auditService.logEvent(user.getId(), "PAYMENT_METHOD_DEFAULT_CHANGED", "SUCCESS", null, null,
                "Set payment method as default: " + paymentMethodId);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePaymentMethod(String email, UUID paymentMethodId) {
        User user = getUser(email);
        UserPaymentMethod method = getPaymentMethod(user.getId(), paymentMethodId);

        boolean wasDefault = Boolean.TRUE.equals(method.getIsDefault());

        // Soft delete to protect historical order and checkout records
        method.setDeleted(true);
        method.setIsDefault(false);
        paymentMethodRepository.save(method);

        // If the removed item was default, designate the next available payment method as default
        if (wasDefault) {
            List<UserPaymentMethod> remaining = paymentMethodRepository
                    .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                UserPaymentMethod nextDefault = remaining.get(0);
                nextDefault.setIsDefault(true);
                paymentMethodRepository.save(nextDefault);
            }
        }

        auditService.logEvent(user.getId(), "PAYMENT_METHOD_REMOVED", "SUCCESS", null, null,
                "Removed payment method: " + paymentMethodId);
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private UserPaymentMethod getPaymentMethod(UUID userId, UUID id) {
        return paymentMethodRepository.findByIdAndUserIdAndDeletedFalse(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + id));
    }

    private String maskVpa(String vpa) {
        if (vpa == null || !vpa.contains("@")) return vpa;
        String[] parts = vpa.split("@", 2);
        String userPart = parts[0];
        String handle = parts[1];

        if (userPart.length() <= 3) {
            return userPart.charAt(0) + "***@" + handle;
        }
        return userPart.substring(0, 3) + "***@" + handle;
    }

    private PaymentMethodResponse mapToResponse(UserPaymentMethod p) {
        return PaymentMethodResponse.builder()
                .id(p.getId())
                .type(p.getType())
                .vpa(p.getVpa())
                .maskedVpa(maskVpa(p.getVpa()))
                .accountHolderName(p.getAccountHolderName())
                .bankName(p.getBankName())
                .isVerified(p.getIsVerified())
                .isDefault(p.getIsDefault())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
