package com.ecommerce.auth.security;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TotpUtilTest {

    @Test
    void generateSecret_shouldReturnValidBase32String() {
        String secret = TotpUtil.generateSecret();
        assertThat(secret).isNotNull().hasSize(32);
        assertThat(secret).matches("^[A-Z2-7]+$");
    }

    @Test
    void getOtpAuthUri_shouldFormatCorrectly() {
        String secret = "JBSWY3DPEHPK3PXP";
        String uri = TotpUtil.getOtpAuthUri("user@aura.com", secret);
        assertThat(uri).startsWith("otpauth://totp/AuraCommerce:user@aura.com?secret=JBSWY3DPEHPK3PXP");
    }

    @Test
    void verifyCode_shouldValidateCurrentCode() {
        String secret = TotpUtil.generateSecret();
        long currentCounter = System.currentTimeMillis() / 1000 / 30;
        String code = TotpUtil.generateCode(secret, currentCounter);

        boolean isValid = TotpUtil.verifyCode(secret, code);
        assertThat(isValid).isTrue();

        boolean isInvalid = TotpUtil.verifyCode(secret, "000000".equals(code) ? "111111" : "000000");
        assertThat(isInvalid).isFalse();
    }

    @Test
    void generateBackupCodes_shouldProduceSpecifiedNumberOfCodes() {
        List<String> codes = TotpUtil.generateBackupCodes(8);
        assertThat(codes).hasSize(8);
        assertThat(codes.get(0)).hasSize(10);
    }
}
