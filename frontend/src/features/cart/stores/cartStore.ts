import { createSignal, createRoot } from "solid-js";
import { CartItem, CartSummary } from "../../../types/cart";
import { fetchCartApi, addCartItemApi, updateCartItemQuantityApi, removeCartItemApi, clearCartApi } from "../../../api/cart";
import { authStore } from "../../auth/stores/authStore";

export const MAX_CART_ITEMS = 12;

function createCartStoreInstance() {
  const [items, setItems] = createSignal<CartItem[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isCartOpen, setIsCartOpen] = createSignal(false);

  const totalQuantity = () => items().reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = () => items().reduce((acc, item) => acc + item.totalPrice, 0);
  const isLimitReached = () => totalQuantity() >= MAX_CART_ITEMS;

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const notifyCartLimit = (customMsg?: string) => {
    const msg = customMsg || `⚠️ Cart limit reached: Maximum ${MAX_CART_ITEMS} items allowed in your cart.`;
    authStore.showToast(msg);
  };

  const loadCart = async () => {
    const userId = authStore.user()?.id;
    setIsLoading(true);
    try {
      const summary: CartSummary = await fetchCartApi(userId);
      setItems(summary.items || []);
    } catch (err) {
      console.warn("Failed to load cart from server", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (product: {
    productId: string;
    sku: string;
    title: string;
    price: number;
    quantity?: number;
    imageUrl?: string;
  }): Promise<boolean> => {
    const qtyToAdd = product.quantity || 1;
    const existing = items().find((i) => i.sku === product.sku || i.productId === product.productId);

    if (totalQuantity() >= MAX_CART_ITEMS) {
      notifyCartLimit(`⚠️ Cart limit reached: You already have the maximum of ${MAX_CART_ITEMS} items in your cart.`);
      openCart();
      return false;
    }

    if (totalQuantity() + qtyToAdd > MAX_CART_ITEMS) {
      const remainingSlots = Math.max(0, MAX_CART_ITEMS - totalQuantity());
      notifyCartLimit(
        remainingSlots > 0
          ? `⚠️ Cart limit reached: You can only add ${remainingSlots} more item${remainingSlots === 1 ? "" : "s"} (max ${MAX_CART_ITEMS}).`
          : `⚠️ Cart limit reached: Maximum ${MAX_CART_ITEMS} items allowed in cart.`
      );
      openCart();
      return false;
    }

    if (!existing && items().length >= MAX_CART_ITEMS) {
      notifyCartLimit(`⚠️ Cart limit reached: Maximum ${MAX_CART_ITEMS} items allowed in your cart.`);
      openCart();
      return false;
    }

    const userId = authStore.user()?.id;
    try {
      const newItem = await addCartItemApi({
        productId: product.productId,
        sku: product.sku,
        title: product.title,
        price: product.price,
        quantity: qtyToAdd,
        imageUrl: product.imageUrl,
      }, userId);

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.sku === newItem.sku || i.productId === newItem.productId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newItem;
          return updated;
        }
        return [newItem, ...prev];
      });

      if (totalQuantity() >= MAX_CART_ITEMS) {
        notifyCartLimit(`Added "${product.title}" • ⚠️ Cart limit reached (${MAX_CART_ITEMS}/${MAX_CART_ITEMS} items full).`);
      } else {
        authStore.showToast(`Added "${product.title}" to cart 🛍️`);
      }
      return true;
    } catch (err: any) {
      if (err?.message?.includes("Cart cannot contain more than") || err?.message?.includes("limit")) {
        notifyCartLimit(`⚠️ Cart limit reached: Maximum ${MAX_CART_ITEMS} items allowed in your cart.`);
        openCart();
        return false;
      }

      // Robust client fallback
      const localItem: CartItem = {
        id: existing?.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.productId,
        sku: product.sku,
        title: product.title,
        price: product.price,
        quantity: existing ? existing.quantity + qtyToAdd : qtyToAdd,
        totalPrice: product.price * (existing ? existing.quantity + qtyToAdd : qtyToAdd),
        imageUrl: product.imageUrl,
      };

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.sku === localItem.sku || i.productId === localItem.productId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = localItem;
          return updated;
        }
        return [localItem, ...prev];
      });

      if (totalQuantity() >= MAX_CART_ITEMS) {
        notifyCartLimit(`Added "${product.title}" • ⚠️ Cart limit reached (${MAX_CART_ITEMS}/${MAX_CART_ITEMS} items full).`);
      } else {
        authStore.showToast(`Added "${product.title}" to cart 🛍️`);
      }
      return true;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    const userId = authStore.user()?.id;
    if (quantity <= 0) {
      await removeItem(itemId);
      return true;
    }

    const otherQty = items()
      .filter((i) => i.id !== itemId)
      .reduce((acc, i) => acc + i.quantity, 0);

    if (otherQty + quantity > MAX_CART_ITEMS) {
      notifyCartLimit(`⚠️ Cart limit reached: Maximum ${MAX_CART_ITEMS} items allowed in your cart.`);
      return false;
    }

    try {
      const updatedItem = await updateCartItemQuantityApi(itemId, quantity, userId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));

      if (totalQuantity() >= MAX_CART_ITEMS) {
        notifyCartLimit(`⚠️ Cart limit reached: Your cart is now at capacity (${MAX_CART_ITEMS}/${MAX_CART_ITEMS}).`);
      }
      return true;
    } catch (err: any) {
      if (err?.message?.includes("Cart cannot contain more than") || err?.message?.includes("limit")) {
        notifyCartLimit(`⚠️ Cart limit reached: Maximum ${MAX_CART_ITEMS} items allowed in your cart.`);
        return false;
      }

      // Local fallback
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity, totalPrice: i.price * quantity } : i))
      );

      if (totalQuantity() >= MAX_CART_ITEMS) {
        notifyCartLimit(`⚠️ Cart limit reached: Your cart is now at capacity (${MAX_CART_ITEMS}/${MAX_CART_ITEMS}).`);
      }
      return true;
    }
  };

  const removeItem = async (itemId: string) => {
    const userId = authStore.user()?.id;
    try {
      await removeCartItemApi(itemId, userId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      authStore.showToast("Removed item from cart");
    } catch (err: any) {
      // Local fallback
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      authStore.showToast("Removed item from cart");
    }
  };

  const clearCart = async () => {
    const userId = authStore.user()?.id;
    try {
      await clearCartApi(userId);
      setItems([]);
      authStore.showToast("Cart cleared");
    } catch (err: any) {
      setItems([]);
      authStore.showToast("Cart cleared");
    }
  };

  return {
    items,
    totalQuantity,
    subtotal,
    isLimitReached,
    isLoading,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    notifyCartLimit,
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}

export const cartStore = createRoot(createCartStoreInstance);
