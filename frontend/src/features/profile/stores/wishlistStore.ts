import { createSignal, createRoot, createEffect } from "solid-js";
import { WishlistItem } from "../../../types/profile";
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  removeFromWishlistBySkuApi,
} from "../../../api/wishlist";
import { authStore } from "../../auth/stores/authStore";

export function toValidUuid(id: string): string {
  if (!id) return "";
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  let hex = "";
  for (let i = 0; i < id.length; i++) {
    const code = id.charCodeAt(i).toString(16);
    hex += code.length === 1 ? "0" + code : code;
  }
  hex = hex.padEnd(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
}

export const MAX_WISHLIST_ITEMS = 12;

export interface WishlistProductInput {
  id: string;
  title: string;
  price: number;
  sku?: string;
  slug?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
}

const GUEST_WISHLIST_KEY = "nani_guest_wishlist";

function getStoredGuestWishlist(): WishlistItem[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function setStoredGuestWishlist(newItems: WishlistItem[]) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newItems));
    }
  } catch {
    // ignore
  }
}

function createWishlistStoreInstance() {
  const [items, setItems] = createSignal<WishlistItem[]>(getStoredGuestWishlist());
  const [isLoading, setIsLoading] = createSignal(false);

  const loadWishlist = async () => {
    let token = (await authStore.getValidAccessToken?.()) || authStore.accessToken();
    if (!token) {
      setItems(getStoredGuestWishlist());
      return;
    }
    setIsLoading(true);
    try {
      const serverData = await fetchWishlistApi(token);
      const guestData = getStoredGuestWishlist();

      // If guest saved items exist, sync them to the server
      if (guestData.length > 0) {
        for (const g of guestData) {
          const alreadyOnServer = (serverData || []).some(
            (s) => s.sku === g.sku || s.productId === g.productId
          );
          if (!alreadyOnServer) {
            try {
              const synced = await addToWishlistApi(
                {
                  productId: g.productId,
                  sku: g.sku,
                  title: g.title,
                  price: g.price,
                  imageUrl: g.imageUrl,
                },
                token
              );
              serverData.unshift(synced);
            } catch (e) {
              console.warn("Failed to sync guest item to server", e);
            }
          }
        }
        setStoredGuestWishlist([]);
      }

      setItems(serverData || []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
      setItems(getStoredGuestWishlist());
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically load when authenticated, revert to guest storage when logged out
  createEffect(() => {
    if (authStore.isAuthenticated()) {
      loadWishlist();
    } else {
      setItems(getStoredGuestWishlist());
    }
  });

  const getWishlistItem = (
    identifierOrProduct: string | WishlistProductInput | WishlistItem | null | undefined
  ): WishlistItem | undefined => {
    if (!identifierOrProduct) return undefined;
    const currentItems = items();

    if (typeof identifierOrProduct === "object") {
      const p = identifierOrProduct as any;
      const targetId: string | undefined = p.id;
      const targetProductId: string | undefined = p.productId || p.id;
      const targetSku: string | undefined = p.sku;
      const targetSlug: string | undefined = p.slug;

      return currentItems.find((item) => {
        // Direct match on wishlist row id
        if (targetId && item.id === targetId) return true;

        // Match on productId or valid UUID of productId/id
        if (targetProductId) {
          if (item.productId === targetProductId) return true;
          if (item.productId === toValidUuid(targetProductId)) return true;
        }
        if (targetId) {
          if (item.productId === targetId) return true;
          if (item.productId === toValidUuid(targetId)) return true;
        }

        // Match on SKU (case-insensitive)
        if (targetSku && item.sku) {
          const skuA = item.sku.toLowerCase().trim();
          const skuB = targetSku.toLowerCase().trim();
          if (skuA === skuB) return true;
          if (skuA.replace(/^sku-/, "") === skuB.replace(/^sku-/, "")) return true;
        }

        // Match on slug (case-insensitive)
        if (targetSlug && item.sku) {
          const skuA = item.sku.toLowerCase().trim();
          const slugB = targetSlug.toLowerCase().trim();
          if (skuA === slugB) return true;
          if (skuA.replace(/^sku-/, "") === slugB.replace(/^sku-/, "")) return true;
        }

        return false;
      });
    }

    const str = String(identifierOrProduct).trim();
    if (!str) return undefined;
    const strLower = str.toLowerCase();
    const strUuid = toValidUuid(str);

    return currentItems.find((item) => {
      // 1. Wishlist item primary key ID
      if (item.id === str) return true;
      // 2. Direct or derived product ID
      if (item.productId === str || item.productId === strUuid) return true;
      // 3. SKU matching (case-insensitive & prefix-tolerant)
      if (item.sku) {
        const itemSkuLower = item.sku.toLowerCase();
        if (itemSkuLower === strLower) return true;
        if (itemSkuLower.replace(/^sku-/, "") === strLower.replace(/^sku-/, "")) return true;
      }
      return false;
    });
  };

  const isWishlisted = (
    identifierOrProduct: string | WishlistProductInput | WishlistItem | null | undefined
  ): boolean => {
    return !!getWishlistItem(identifierOrProduct);
  };

  const addToWishlist = async (product: WishlistProductInput): Promise<boolean> => {
    let token = (await authStore.getValidAccessToken?.()) || authStore.accessToken();
    const sku =
      product.sku ||
      (product.slug ? product.slug.toUpperCase() : `SKU-${String(product.id || "").slice(0, 8).toUpperCase()}`);
    const validUuid = toValidUuid(product.id || (product as any).productId || "");
    const imageUrl = product.imageUrl || product.thumbnailUrl || "";

    if (!token) {
      const guestItem: WishlistItem = {
        id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: validUuid || product.id,
        sku,
        title: product.title,
        price: product.price,
        imageUrl,
        inStock: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [guestItem, ...items().filter((i) => i.sku !== sku && i.productId !== guestItem.productId)];
      setItems(updated);
      setStoredGuestWishlist(updated);

      authStore.showToast(`Saved "${product.title}" to wishlist ❤️`);

      authStore.requireAuth(
        () => addToWishlist(product),
        `Sign in to sync "${product.title}" with your account`
      );
      return true;
    }

    if (!isWishlisted(product) && items().length >= MAX_WISHLIST_ITEMS) {
      authStore.showToast(`Wishlist limit reached (maximum ${MAX_WISHLIST_ITEMS} items)`);
      return false;
    }

    try {
      const savedItem = await addToWishlistApi(
        {
          productId: validUuid,
          sku,
          title: product.title,
          price: product.price,
          imageUrl,
        },
        token
      );

      setItems((prev) => {
        const existingIdx = prev.findIndex(
          (i) => i.id === savedItem.id || i.sku === sku || i.productId === validUuid || i.productId === product.id
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = savedItem;
          return updated;
        }
        return [savedItem, ...prev];
      });

      authStore.showToast(`Saved "${product.title}" to wishlist ❤️`);
      return true;
    } catch (err: any) {
      console.error("Failed to add to wishlist", err);
      authStore.showToast(err.message || "Failed to add to wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (
    target: string | WishlistItem | WishlistProductInput
  ): Promise<boolean> => {
    let token = (await authStore.getValidAccessToken?.()) || authStore.accessToken();
    const itemToDelete = getWishlistItem(target);
    const fallbackId = typeof target === "string" ? target.trim() : "";

    if (!itemToDelete && !fallbackId) {
      return false;
    }

    if (!token) {
      const updated = items().filter((i) => {
        if (itemToDelete) return i.id !== itemToDelete.id;
        return (
          i.id !== fallbackId &&
          i.sku !== fallbackId &&
          i.sku.toLowerCase() !== fallbackId.toLowerCase() &&
          i.productId !== fallbackId
        );
      });
      setItems(updated);
      setStoredGuestWishlist(updated);
      authStore.showToast("Item removed from wishlist");
      return true;
    }

    // Save previous state for optimistic rollback
    const previousItems = items();

    // OPTIMISTIC UPDATE: immediately remove the item from local items signal
    setItems((prev) =>
      prev.filter((i) => {
        if (itemToDelete) {
          return i.id !== itemToDelete.id;
        }
        return (
          i.id !== fallbackId &&
          i.sku !== fallbackId &&
          i.sku.toLowerCase() !== fallbackId.toLowerCase() &&
          i.productId !== fallbackId &&
          i.productId !== toValidUuid(fallbackId)
        );
      })
    );

    try {
      if (itemToDelete?.id) {
        await removeFromWishlistApi(itemToDelete.id, token);
      } else if (fallbackId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(fallbackId)) {
          await removeFromWishlistApi(fallbackId, token);
        } else {
          await removeFromWishlistBySkuApi(fallbackId, token);
        }
      }

      authStore.showToast("Item removed from wishlist");
      return true;
    } catch (err: any) {
      console.error("Failed to remove from wishlist", err);
      // ROLLBACK: Restore previous items on failure
      setItems(previousItems);
      authStore.showToast(err.message || "Failed to remove item from wishlist");
      return false;
    }
  };

  const toggleWishlist = async (product: WishlistProductInput): Promise<boolean> => {
    if (!authStore.isAuthenticated()) {
      addToWishlist(product);
      authStore.requireAuth(
        () => toggleWishlist(product),
        `Sign in to save "${product.title}" to your wishlist`
      );
      return false;
    }

    const existingItem = getWishlistItem(product);
    if (existingItem) {
      return await removeFromWishlist(existingItem);
    } else {
      return await addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setItems([]);
    setStoredGuestWishlist([]);
  };

  return {
    items,
    isLoading,
    totalCount: () => items().length,
    isWishlisted,
    getWishlistItem,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };
}

export const wishlistStore = createRoot(createWishlistStoreInstance);
