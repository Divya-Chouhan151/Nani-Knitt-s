import { WishlistItem } from "../types/profile";
import { authStore } from "../features/auth/stores/authStore";

const WISHLIST_API_URL = typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
  ? (import.meta.env.VITE_PROFILE_API_URL ? `${import.meta.env.VITE_PROFILE_API_URL}/wishlist` : `${window.location.origin}/api/v1/profile/wishlist`)
  : "http://localhost:8081/api/v1/profile/wishlist";

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchWithRetry(url: string, init: RequestInit, token?: string | null): Promise<Response> {
  let effectiveToken = token !== undefined ? token : authStore.accessToken();
  let headers = {
    ...getAuthHeaders(effectiveToken),
    ...(init.headers as Record<string, string>),
  };

  let res = await fetch(url, { ...init, headers, credentials: "include" });

  if (res.status === 401 || res.status === 403) {
    try {
      const refreshedToken = await authStore.refreshToken();
      if (refreshedToken) {
        headers = {
          ...getAuthHeaders(refreshedToken),
          ...(init.headers as Record<string, string>),
        };
        res = await fetch(url, { ...init, headers, credentials: "include" });
      }
    } catch {
      // Fall through to return original res
    }
  }

  return res;
}

export async function fetchWishlistApi(token?: string | null): Promise<WishlistItem[]> {
  const res = await fetchWithRetry(`${WISHLIST_API_URL}`, { method: "GET" }, token);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || "Failed to fetch wishlist");
  }
  return await res.json();
}

export async function addToWishlistApi(
  item: { productId: string; sku: string; title: string; price: number; imageUrl?: string },
  token?: string | null
): Promise<WishlistItem> {
  const res = await fetchWithRetry(
    `${WISHLIST_API_URL}`,
    {
      method: "POST",
      body: JSON.stringify(item),
    },
    token
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || "Failed to add item to wishlist");
  }
  return await res.json();
}

export async function removeFromWishlistApi(id: string, token?: string | null): Promise<void> {
  const res = await fetchWithRetry(`${WISHLIST_API_URL}/${id}`, { method: "DELETE" }, token);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || "Failed to remove item from wishlist");
  }
}

export async function removeFromWishlistBySkuApi(sku: string, token?: string | null): Promise<void> {
  const encodedSku = encodeURIComponent(sku);
  const res = await fetchWithRetry(`${WISHLIST_API_URL}/sku/${encodedSku}`, { method: "DELETE" }, token);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || "Failed to remove item from wishlist");
  }
}

export async function removeFromWishlistByProductIdApi(productId: string, token?: string | null): Promise<void> {
  const res = await fetchWithRetry(`${WISHLIST_API_URL}/product/${productId}`, { method: "DELETE" }, token);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || "Failed to remove item from wishlist");
  }
}
