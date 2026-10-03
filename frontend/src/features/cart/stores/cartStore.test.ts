import { describe, it, expect, beforeEach, vi } from "vitest";
import { cartStore, MAX_CART_ITEMS } from "./cartStore";
import { authStore } from "../../auth/stores/authStore";
import * as cartApi from "../../../api/cart";

describe("cartStore", () => {
  beforeEach(async () => {
    vi.spyOn(cartApi, "clearCartApi").mockResolvedValue(undefined as any);
    await cartStore.clearCart();
    vi.clearAllMocks();
  });

  it("initializes with empty items and limit not reached", () => {
    expect(cartStore.items()).toEqual([]);
    expect(cartStore.totalQuantity()).toBe(0);
    expect(cartStore.subtotal()).toBe(0);
    expect(cartStore.isLimitReached()).toBe(false);
  });

  it("notifies user when cart limit of 12 items is reached and blocks 13th item", async () => {
    const toastSpy = vi.spyOn(authStore, "showToast");
    vi.spyOn(cartApi, "addCartItemApi").mockImplementation(async (item) => ({
      id: `cart-${item.sku}`,
      productId: item.productId,
      sku: item.sku,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity,
    }));

    for (let i = 1; i <= 12; i++) {
      await cartStore.addItem({
        productId: `p-${i}`,
        sku: `SKU-${i}`,
        title: `Item ${i}`,
        price: 10,
        quantity: 1,
      });
    }

    expect(cartStore.items().length).toBe(12);
    expect(cartStore.totalQuantity()).toBe(12);
    expect(cartStore.isLimitReached()).toBe(true);
    // Notification that limit was reached
    expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Cart limit reached/i));

    // Attempting to add 13th item should be blocked and notify user
    const result = await cartStore.addItem({
      productId: "p-13",
      sku: "SKU-13",
      title: "Item 13",
      price: 10,
      quantity: 1,
    });

    expect(result).toBe(false);
    expect(cartStore.items().length).toBe(12);
    expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Cart limit reached/i));
  });

  it("notifies user and blocks addition when quantity exceeds total limit of 12 items", async () => {
    const toastSpy = vi.spyOn(authStore, "showToast");
    vi.spyOn(cartApi, "addCartItemApi").mockImplementation(async (item) => ({
      id: `cart-${item.sku}`,
      productId: item.productId,
      sku: item.sku,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity,
    }));

    await cartStore.addItem({
      productId: "p-1",
      sku: "SKU-1",
      title: "Item 1",
      price: 10,
      quantity: 10,
    });

    expect(cartStore.totalQuantity()).toBe(10);
    expect(cartStore.isLimitReached()).toBe(false);

    // Adding 3 more items would exceed 12 items
    const result = await cartStore.addItem({
      productId: "p-2",
      sku: "SKU-2",
      title: "Item 2",
      price: 10,
      quantity: 3,
    });

    expect(result).toBe(false);
    expect(cartStore.totalQuantity()).toBe(10);
    expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Cart limit reached/i));
  });

  it("notifies user and prevents updating quantity to exceed 12 items", async () => {
    const toastSpy = vi.spyOn(authStore, "showToast");
    vi.spyOn(cartApi, "addCartItemApi").mockImplementation(async (item) => ({
      id: `cart-${item.sku}`,
      productId: item.productId,
      sku: item.sku,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity,
    }));

    await cartStore.addItem({
      productId: "p-1",
      sku: "SKU-1",
      title: "Item 1",
      price: 10,
      quantity: 5,
    });

    const updateResult = await cartStore.updateQuantity("cart-SKU-1", 15);
    expect(updateResult).toBe(false);
    expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Cart limit reached/i));
  });
});
