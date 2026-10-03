package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.request.AddressRequest;
import com.ecommerce.auth.dto.response.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {
    List<AddressResponse> getAddresses(String email);
    AddressResponse createAddress(String email, AddressRequest request);
    AddressResponse updateAddress(String email, UUID addressId, AddressRequest request);
    void deleteAddress(String email, UUID addressId);
    AddressResponse setDefaultShipping(String email, UUID addressId);
    AddressResponse setDefaultBilling(String email, UUID addressId);
}
