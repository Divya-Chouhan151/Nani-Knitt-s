package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.response.VpaValidationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class PaymentGatewayServiceTest {

    private PaymentGatewayServiceImpl gatewayService;

    @BeforeEach
    void setUp() {
        gatewayService = new PaymentGatewayServiceImpl();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "rahul@okhdfcbank",
            "priya.sharma@okicici",
            "john_doe-42@oksbi",
            "merchant.pay@okaxis",
            "user123@paytm"
    })
    void validateVpa_withValidFormats_shouldReturnValidResponse(String vpa) {
        VpaValidationResponse res = gatewayService.validateVpa(vpa);
        assertTrue(res.getIsValid());
        assertNotNull(res.getAccountHolderName());
        assertNotNull(res.getBankName());
        assertNotNull(res.getGatewayReferenceId());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "   ",
            "invalid",
            "@bank",
            "user@",
            "user@123",
            "u@bank", // local-part < 2 chars
            "user@toolonghandlethatexceedssixtyfourcharacterslimitandshouldbeflaggedasinvalidbyregexpatternvalidationinupi",
            "invalid@bank",
            "failed@okhdfcbank",
            "unverified@okaxis"
    })
    void validateVpa_withInvalidOrUnverifiedFormats_shouldReturnInvalidResponse(String vpa) {
        VpaValidationResponse res = gatewayService.validateVpa(vpa);
        assertFalse(res.getIsValid());
        assertNull(res.getAccountHolderName());
        assertTrue(res.getMessage().contains("couldn't verify this UPI ID"));
    }

    @Test
    void validateVpa_shouldResolveProperBankName() {
        VpaValidationResponse hdfc = gatewayService.validateVpa("user@okhdfcbank");
        assertEquals("HDFC Bank", hdfc.getBankName());

        VpaValidationResponse icici = gatewayService.validateVpa("user@okicici");
        assertEquals("ICICI Bank", icici.getBankName());

        VpaValidationResponse sbi = gatewayService.validateVpa("user@oksbi");
        assertEquals("State Bank of India", sbi.getBankName());
    }
}
