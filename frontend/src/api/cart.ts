import { CartItem, CartSummary } from "../types/cart";

const CART_API_URL = typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
  ? (import.meta.env.VITE_CART_API_URL || `${window.location.origin}/api/v1/cart`)
  : "http://localhost:8082/api/v1/cart";

function getHeaders(userId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  return headers;
}

export async function fetchCartApi(userId?: string): Promise<CartSummary> {
  try {
    const res = await fetch(`${CART_API_URL}`, {
      headers: getHeaders(userId),
    });
    if (!res.ok) throw new Error("Failed to load cart");
    return await res.json();
  } catch (err) {
    console.warn("Cart API unreachable, using local fallback state", err);
    return { items: [], totalQuantity: 0, subtotal: 0 };
  }
}

export async function addCartItemApi(
  item: { productId: string; sku: string; title: string; price: number; quantity: number; imageUrl?: string },
  userId?: string
): Promise<CartItem> {
  const res = await fetch(`${CART_API_URL}/items`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.error || "Failed to add item to cart";
    throw new Error(msg);
  }
  return await res.json();
}

export async function updateCartItemQuantityApi(itemId: string, quantity: number, userId?: string): Promise<CartItem> {
  const res = await fetch(`${CART_API_URL}/items/${itemId}`, {
    method: "PUT",
    headers: getHeaders(userId),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.error || "Failed to update item quantity";
    throw new Error(msg);
  }
  return await res.json();
}

export async function removeCartItemApi(itemId: string, userId?: string): Promise<void> {
  const res = await fetch(`${CART_API_URL}/items/${itemId}`, {
    method: "DELETE",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to remove item from cart");
}

export async function clearCartApi(userId?: string): Promise<void> {
  const res = await fetch(`${CART_API_URL}`, {
    method: "DELETE",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to clear cart");
}
