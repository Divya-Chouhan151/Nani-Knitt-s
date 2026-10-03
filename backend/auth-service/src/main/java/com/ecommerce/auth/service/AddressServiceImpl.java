package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AddressRequest;
import com.ecommerce.auth.dto.response.AddressResponse;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.entity.UserAddress;
import com.ecommerce.auth.exception.InvalidCredentialsException;
import com.ecommerce.auth.repository.UserAddressRepository;
import com.ecommerce.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(String email) {
        User user = getUser(email);
        return addressRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse createAddress(String email, AddressRequest request) {
        User user = getUser(email);
        List<UserAddress> existingAddresses = addressRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId());

        if (existingAddresses.size() >= 10) {
            // Soft-delete the oldest non-default address to accommodate the new address
            UserAddress toArchive = existingAddresses.stream()
                    .filter(a -> !Boolean.TRUE.equals(a.getIsDefaultShipping()) && !Boolean.TRUE.equals(a.getIsDefaultBilling()))
                    .reduce((first, second) -> second)
                    .orElse(existingAddresses.get(existingAddresses.size() - 1));
            toArchive.setDeleted(true);
            addressRepository.save(toArchive);
        }

        boolean isFirst = existingAddresses.isEmpty();

        boolean defaultShipping = Boolean.TRUE.equals(request.getIsDefaultShipping()) || isFirst;
        boolean defaultBilling = Boolean.TRUE.equals(request.getIsDefaultBilling()) || isFirst;

        if (defaultShipping) {
            addressRepository.resetDefaultShipping(user.getId());
        }
        if (defaultBilling) {
            addressRepository.resetDefaultBilling(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .label(request.getLabel().trim())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .addressLine1(request.getAddressLine1().trim())
                .addressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null)
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry().trim())
                .isDefaultShipping(defaultShipping)
                .isDefaultBilling(defaultBilling)
                .deleted(false)
                .build();

        UserAddress saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, UUID addressId, AddressRequest request) {
        User user = getUser(email);
        UserAddress address = getAddress(user.getId(), addressId);

        if (Boolean.TRUE.equals(request.getIsDefaultShipping())) {
            addressRepository.resetDefaultShipping(user.getId());
            address.setIsDefaultShipping(true);
        }
        if (Boolean.TRUE.equals(request.getIsDefaultBilling())) {
            addressRepository.resetDefaultBilling(user.getId());
            address.setIsDefaultBilling(true);
        }

        address.setLabel(request.getLabel().trim());
        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null);
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());

        UserAddress saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, UUID addressId) {
        User user = getUser(email);
        UserAddress address = getAddress(user.getId(), addressId);
        // Soft delete to protect historical orders
        address.setDeleted(true);
        addressRepository.save(address);
    }

    @Override
    @Transactional
    public AddressResponse setDefaultShipping(String email, UUID addressId) {
        User user = getUser(email);
        UserAddress address = getAddress(user.getId(), addressId);
        addressRepository.resetDefaultShipping(user.getId());
        address.setIsDefaultShipping(true);
        return mapToResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse setDefaultBilling(String email, UUID addressId) {
        User user = getUser(email);
        UserAddress address = getAddress(user.getId(), addressId);
        addressRepository.resetDefaultBilling(user.getId());
        address.setIsDefaultBilling(true);
        return mapToResponse(addressRepository.save(address));
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private UserAddress getAddress(UUID userId, UUID addressId) {
        return addressRepository.findByIdAndUserIdAndDeletedFalse(addressId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found: " + addressId));
    }

    private AddressResponse mapToResponse(UserAddress a) {
        return AddressResponse.builder()
                .id(a.getId())
                .label(a.getLabel())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .isDefaultShipping(a.getIsDefaultShipping())
                .isDefaultBilling(a.getIsDefaultBilling())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
