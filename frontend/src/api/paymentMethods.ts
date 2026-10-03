import { PaymentMethod, VpaValidationResult } from "../types/profile";

const PAYMENT_METHODS_API_URL = import.meta.env.VITE_PROFILE_API_URL
  ? `${import.meta.env.VITE_PROFILE_API_URL}/payment-methods`
  : "http://localhost:8081/api/v1/profile/payment-methods";

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPaymentMethodsApi(token?: string | null): Promise<PaymentMethod[]> {
  const res = await fetch(`${PAYMENT_METHODS_API_URL}`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load payment methods");
  }
  return await res.json();
}

export async function validateVpaApi(vpa: string, token?: string | null): Promise<VpaValidationResult> {
  const res = await fetch(`${PAYMENT_METHODS_API_URL}/validate-vpa`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ vpa }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "We couldn't verify this UPI ID. Please check and try again.");
  }
  return await res.json();
}

export async function addUpiPaymentMethodApi(
  payload: { vpa: string; isDefault?: boolean },
  token?: string | null
): Promise<PaymentMethod> {
  const res = await fetch(`${PAYMENT_METHODS_API_URL}/upi`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save UPI ID");
  }
  return await res.json();
}

export async function setDefaultPaymentMethodApi(
  id: string,
  token?: string | null
): Promise<PaymentMethod> {
  const res = await fetch(`${PAYMENT_METHODS_API_URL}/${id}/default`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to set default payment method");
  }
  return await res.json();
}

export async function deletePaymentMethodApi(
  id: string,
  token?: string | null
): Promise<void> {
  const res = await fetch(`${PAYMENT_METHODS_API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete payment method");
  }
}
