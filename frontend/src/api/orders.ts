import { OrderDetail, OrderSummary } from "../types/profile";

const ORDERS_API_URL = import.meta.env.VITE_PROFILE_API_URL
  ? `${import.meta.env.VITE_PROFILE_API_URL}/orders`
  : "http://localhost:8081/api/v1/profile/orders";

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function fetchOrdersApi(
  options: { status?: string; startDate?: string; endDate?: string; page?: number; size?: number } = {},
  token?: string | null
): Promise<PageResponse<OrderSummary>> {
  const params = new URLSearchParams();
  if (options.status && options.status !== "ALL") params.append("status", options.status);
  if (options.startDate) params.append("startDate", options.startDate);
  if (options.endDate) params.append("endDate", options.endDate);
  if (options.page !== undefined) params.append("page", options.page.toString());
  if (options.size !== undefined) params.append("size", options.size.toString());

  const url = `${ORDERS_API_URL}${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
}

export async function fetchOrderDetailApi(orderId: string, token?: string | null): Promise<OrderDetail> {
  const res = await fetch(`${ORDERS_API_URL}/${orderId}`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch order details");
  return await res.json();
}

export async function cancelOrderApi(orderId: string, reason: string, token?: string | null): Promise<void> {
  const res = await fetch(`${ORDERS_API_URL}/${orderId}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to cancel order");
  }
}

export async function initiateReturnApi(orderId: string, reason: string, token?: string | null): Promise<{ status: string }> {
  const res = await fetch(`${ORDERS_API_URL}/${orderId}/return`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to initiate return");
  }
  return await res.json();
}
