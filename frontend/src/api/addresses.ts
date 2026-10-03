import { Address, AddressPayload } from "../types/profile";

const ADDRESS_API_URL = import.meta.env.VITE_PROFILE_API_URL
  ? `${import.meta.env.VITE_PROFILE_API_URL}/addresses`
  : (typeof window !== "undefined" ? `${window.location.origin}/api/v1/profile/addresses` : "http://localhost:8081/api/v1/profile/addresses");

const STORAGE_KEY = "nani_user_addresses";

function getLocalAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalAddresses(addrs: Address[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addrs));
  } catch {
    // ignore
  }
}

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchAddressesApi(token?: string | null): Promise<Address[]> {
  try {
    const res = await fetch(`${ADDRESS_API_URL}`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalAddresses(data);
      return data;
    }
  } catch {
    // network fallback
  }

  // Fallback to local storage
  return getLocalAddresses();
}

export async function createAddressApi(payload: AddressPayload, token?: string | null): Promise<Address> {
  if (token) {
    try {
      const res = await fetch(`${ADDRESS_API_URL}`, {
        method: "POST",
        headers: getAuthHeaders(token),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
      let errorMessage = `Failed to create address (${res.status}): ${res.statusText}`;
      const errData = await res.json().catch(() => null);
      if (errData) {
        if (errData.errors && Array.isArray(errData.errors) && errData.errors.length > 0) {
          const fieldMsgs = errData.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
          errorMessage = `Validation failed: ${fieldMsgs}`;
        } else if (errData.message) {
          errorMessage = errData.message;
        }
      }
      if (res.status === 400) {
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      if (err.message && err.message.includes("Validation failed")) {
        throw err;
      }
    }
  }

  // Local storage fallback for guests or offline
  const list = getLocalAddresses();
  if (list.length >= 10) {
    // Retain up to 9 and append new one
    list.pop();
  }
  const isFirst = list.length === 0;
  const isDefaultShipping = payload.isDefaultShipping ?? isFirst;
  const isDefaultBilling = payload.isDefaultBilling ?? isFirst;

  const updatedList = list.map((a) => ({
    ...a,
    isDefaultShipping: isDefaultShipping ? false : a.isDefaultShipping,
    isDefaultBilling: isDefaultBilling ? false : a.isDefaultBilling,
  }));

  const newAddress: Address = {
    id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    label: payload.label || "Home",
    fullName: payload.fullName,
    phone: payload.phone,
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    country: payload.country,
    isDefaultShipping,
    isDefaultBilling,
    createdAt: new Date().toISOString(),
  };

  updatedList.unshift(newAddress);
  saveLocalAddresses(updatedList);
  return newAddress;
}

export async function updateAddressApi(id: string, payload: AddressPayload, token?: string | null): Promise<Address> {
  try {
    const res = await fetch(`${ADDRESS_API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // network fallback
  }

  const list = getLocalAddresses();
  const updatedList = list.map((a) => {
    if (a.id === id) {
      return {
        ...a,
        label: payload.label,
        fullName: payload.fullName,
        phone: payload.phone,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode,
        country: payload.country,
        isDefaultShipping: payload.isDefaultShipping ?? a.isDefaultShipping,
        isDefaultBilling: payload.isDefaultBilling ?? a.isDefaultBilling,
      };
    }
    return {
      ...a,
      isDefaultShipping: payload.isDefaultShipping ? false : a.isDefaultShipping,
      isDefaultBilling: payload.isDefaultBilling ? false : a.isDefaultBilling,
    };
  });

  saveLocalAddresses(updatedList);
  const found = updatedList.find((a) => a.id === id);
  if (!found) throw new Error("Address not found");
  return found;
}

export async function deleteAddressApi(id: string, token?: string | null): Promise<void> {
  try {
    const res = await fetch(`${ADDRESS_API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    if (res.ok) return;
  } catch {
    // network fallback
  }

  const list = getLocalAddresses().filter((a) => a.id !== id);
  saveLocalAddresses(list);
}

export async function setDefaultShippingApi(id: string, token?: string | null): Promise<Address> {
  try {
    const res = await fetch(`${ADDRESS_API_URL}/${id}/default-shipping`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {
    // network fallback
  }

  const list = getLocalAddresses().map((a) => ({
    ...a,
    isDefaultShipping: a.id === id,
  }));
  saveLocalAddresses(list);
  const found = list.find((a) => a.id === id);
  if (!found) throw new Error("Address not found");
  return found;
}

export async function setDefaultBillingApi(id: string, token?: string | null): Promise<Address> {
  try {
    const res = await fetch(`${ADDRESS_API_URL}/${id}/default-billing`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {
    // network fallback
  }

  const list = getLocalAddresses().map((a) => ({
    ...a,
    isDefaultBilling: a.id === id,
  }));
  saveLocalAddresses(list);
  const found = list.find((a) => a.id === id);
  if (!found) throw new Error("Address not found");
  return found;
}
