package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.WishlistItemRequest;
import com.ecommerce.auth.dto.response.WishlistItemResponse;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.WishlistItem;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceImplTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WishlistServiceImpl wishlistService;

    private User testUser;
    private final String testEmail = "tester@example.com";
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(testUserId)
                .email(testEmail)
                .firstName("Test")
                .lastName("User")
                .status("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("Should successfully add up to 12 distinct items in a row")
    void shouldAdd12ItemsInARowSuccessfully() {
        when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(testUser));
        when(wishlistRepository.findByUserIdAndSkuIgnoreCase(eq(testUserId), anyString())).thenReturn(Optional.empty());
        when(wishlistRepository.findByUserIdAndProductId(eq(testUserId), any(UUID.class))).thenReturn(Optional.empty());

        List<WishlistItem> persisted = new ArrayList<>();
        when(wishlistRepository.countByUserId(testUserId)).thenAnswer(inv -> (long) persisted.size());
        when(wishlistRepository.saveAndFlush(any(WishlistItem.class))).thenAnswer(inv -> {
            WishlistItem item = inv.getArgument(0);
            item.setId(UUID.randomUUID());
            persisted.add(item);
            return item;
        });

        for (int i = 1; i <= 12; i++) {
            WishlistItemRequest req = WishlistItemRequest.builder()
                    .productId(UUID.randomUUID())
                    .sku("SKU-" + i)
                    .title("Product " + i)
                    .price(BigDecimal.valueOf(10.0 * i))
                    .imageUrl("https://example.com/img" + i + ".jpg")
                    .build();

            WishlistItemResponse res = wishlistService.addItem(testEmail, req);
            assertThat(res).isNotNull();
            assertThat(res.getSku()).isEqualTo("SKU-" + i);
            assertThat(res.getTitle()).isEqualTo("Product " + i);
        }

        assertThat(persisted).hasSize(12);
        verify(wishlistRepository, times(12)).saveAndFlush(any(WishlistItem.class));
    }

    @Test
    @DisplayName("Should reject adding 13th item when maximum limit of 12 is reached")
    void shouldReject13thItemWhenLimitReached() {
        when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(testUser));
        when(wishlistRepository.findByUserIdAndSkuIgnoreCase(eq(testUserId), anyString())).thenReturn(Optional.empty());
        when(wishlistRepository.findByUserIdAndProductId(eq(testUserId), any(UUID.class))).thenReturn(Optional.empty());
        when(wishlistRepository.countByUserId(testUserId)).thenReturn(12L);

        WishlistItemRequest req = WishlistItemRequest.builder()
                .productId(UUID.randomUUID())
                .sku("SKU-13")
                .title("Product 13")
                .price(BigDecimal.valueOf(130.0))
                .build();

        assertThatThrownBy(() -> wishlistService.addItem(testEmail, req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Wishlist cannot contain more than 12 items");

        verify(wishlistRepository, never()).saveAndFlush(any(WishlistItem.class));
    }

    @Test
    @DisplayName("Should update existing item if same SKU or ProductId is added again without duplicating")
    void shouldUpdateExistingItemOnDuplicateAdd() {
        UUID existingItemId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        String sku = "SKU-EXISTS";

        WishlistItem existing = WishlistItem.builder()
                .id(existingItemId)
                .user(testUser)
                .productId(productId)
                .sku(sku)
                .title("Old Title")
                .price(BigDecimal.valueOf(50.0))
                .imageUrl("https://example.com/old.jpg")
                .inStock(true)
                .build();

        when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(testUser));
        when(wishlistRepository.findByUserIdAndSkuIgnoreCase(testUserId, sku)).thenReturn(Optional.of(existing));
        when(wishlistRepository.saveAndFlush(any(WishlistItem.class))).thenAnswer(inv -> inv.getArgument(0));

        WishlistItemRequest updateReq = WishlistItemRequest.builder()
                .productId(productId)
                .sku(sku)
                .title("Updated Title")
                .price(BigDecimal.valueOf(65.0))
                .imageUrl("https://example.com/new.jpg")
                .build();

        WishlistItemResponse res = wishlistService.addItem(testEmail, updateReq);

        assertThat(res.getId()).isEqualTo(existingItemId);
        assertThat(res.getTitle()).isEqualTo("Updated Title");
        assertThat(res.getPrice()).isEqualTo(BigDecimal.valueOf(65.0));
        assertThat(res.getImageUrl()).isEqualTo("https://example.com/new.jpg");

        verify(wishlistRepository, never()).countByUserId(any());
        verify(wishlistRepository).saveAndFlush(existing);
    }
}
