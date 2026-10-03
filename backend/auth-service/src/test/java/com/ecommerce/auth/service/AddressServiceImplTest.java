package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AddressRequest;
import com.ecommerce.auth.dto.response.AddressResponse;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.UserAddress;
import com.ecommerce.auth.repository.UserAddressRepository;
import com.ecommerce.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    @Mock
    private UserAddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressServiceImpl addressService;

    private User testUser;
    private final String testEmail = "testuser@ecommerce.com";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email(testEmail)
                .firstName("Test")
                .lastName("User")
                .build();
    }

    @Test
    @DisplayName("Successfully save real-world Bengaluru address with Ambedkar Veedhi coordinates/locality")
    void createAddress_Success_WithRealBengaluruLocation() {
        when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(testUser));
        when(addressRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(new ArrayList<>());

        AddressRequest request = AddressRequest.builder()
                .label("Home")
                .fullName("John Doe")
                .phone("+91 9876543210")
                .addressLine1("Doctor B R Ambedkar Veedhi, Sampangirama Nagar")
                .addressLine2("Near Vidhana Soudha, Gate 2")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560001")
                .country("India")
                .isDefaultShipping(true)
                .isDefaultBilling(false)
                .build();

        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> {
            UserAddress saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        AddressResponse response = addressService.createAddress(testEmail, request);

        assertNotNull(response);
        assertEquals("Doctor B R Ambedkar Veedhi, Sampangirama Nagar", response.getAddressLine1());
        assertEquals("Bengaluru", response.getCity());
        assertEquals("Karnataka", response.getState());
        assertEquals("560001", response.getPostalCode());
        assertEquals("India", response.getCountry());
        assertTrue(response.getIsDefaultShipping());

        verify(addressRepository, times(1)).resetDefaultShipping(testUser.getId());
    }

    @Test
    @DisplayName("Regression test: Saving address when user already has 10 addresses prunes oldest non-default instead of failing")
    void createAddress_Regression_WhenUserHas10Addresses_ArchivesOldestNonDefault() {
        when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(testUser));

        List<UserAddress> tenExisting = new ArrayList<>();
        // First one is default shipping
        tenExisting.add(UserAddress.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .label("Default Address")
                .isDefaultShipping(true)
                .isDefaultBilling(true)
                .deleted(false)
                .build());

        // Add 9 non-default addresses
        for (int i = 1; i <= 9; i++) {
            tenExisting.add(UserAddress.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .label("Address " + i)
                    .isDefaultShipping(false)
                    .isDefaultBilling(false)
                    .deleted(false)
                    .build());
        }

        when(addressRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(tenExisting);

        AddressRequest request = AddressRequest.builder()
                .label("Office 11")
                .fullName("Jane Doe")
                .phone("+91 9999988888")
                .addressLine1("Indiranagar 100ft Road")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560038")
                .country("India")
                .isDefaultShipping(false)
                .isDefaultBilling(false)
                .build();

        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> {
            UserAddress saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });

        // Must succeed without throwing IllegalArgumentException
        AddressResponse response = assertDoesNotThrow(() -> addressService.createAddress(testEmail, request));

        assertNotNull(response);
        assertEquals("Indiranagar 100ft Road", response.getAddressLine1());

        // Verify that the oldest non-default address was archived (deleted = true)
        ArgumentCaptor<UserAddress> addressCaptor = ArgumentCaptor.forClass(UserAddress.class);
        verify(addressRepository, atLeast(2)).save(addressCaptor.capture());

        List<UserAddress> savedAddresses = addressCaptor.getAllValues();
        // The first save is the archived address
        UserAddress archived = savedAddresses.get(0);
        assertTrue(archived.getDeleted(), "Oldest non-default address should be marked as deleted");
        assertFalse(Boolean.TRUE.equals(archived.getIsDefaultShipping()), "Archived address must not be default shipping");
    }

    @Test
    @DisplayName("First address automatically becomes default shipping and billing")
    void createAddress_FirstAddress_BecomesDefault() {
        when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(testUser));
        when(addressRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(new ArrayList<>());

        AddressRequest request = AddressRequest.builder()
                .label("Home")
                .fullName("First User")
                .phone("+91 9123456789")
                .addressLine1("Connaught Place")
                .city("New Delhi")
                .state("Delhi")
                .postalCode("110001")
                .country("India")
                .isDefaultShipping(false)
                .isDefaultBilling(false)
                .build();

        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> {
            UserAddress saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        AddressResponse response = addressService.createAddress(testEmail, request);

        assertTrue(response.getIsDefaultShipping(), "First address should be default shipping");
        assertTrue(response.getIsDefaultBilling(), "First address should be default billing");
    }
}
