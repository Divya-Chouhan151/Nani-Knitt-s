import { describe, it, expect, beforeEach, vi } from "vitest";
import { wishlistStore } from "./wishlistStore";
import { authStore } from "../../auth/stores/authStore";
import * as wishlistApi from "../../../api/wishlist";
import * as authApi from "../../../api/auth";

describe("wishlistStore", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(authApi, "logoutApi").mockResolvedValue(undefined);
    wishlistStore.clearWishlist();
    authStore.closeAuthModal();
  });

  it("initializes with empty items", () => {
    expect(wishlistStore.items()).toEqual([]);
    expect(wishlistStore.totalCount()).toBe(0);
  });

  it("identifies wishlisted items by id or sku", () => {
    expect(wishlistStore.isWishlisted("prod-123")).toBe(false);
  });

  it("identifies wishlisted items flexibly by non-UUID product id, slug, sku or object", async () => {
    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "accessToken").mockReturnValue("mock-token");

    const mockItem = {
      id: "wishlist-row-uuid-1",
      productId: "6b6e6974-2d30-4310-a000-000000000000", // toValidUuid("knit-01")
      sku: "CHUNKY-HAND-KNIT-MERINO-WOOL-BLANKET",
      title: "Chunky Hand-Knit Merino Wool Blanket",
      price: 189.99,
      imageUrl: "https://example.com/knit-01.jpg",
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(wishlistApi, "addToWishlistApi").mockResolvedValue(mockItem);

    await wishlistStore.addToWishlist({
      id: "knit-01",
      title: mockItem.title,
      price: mockItem.price,
      slug: "chunky-hand-knit-merino-wool-blanket",
    });

    // 1. By raw product ID
    expect(wishlistStore.isWishlisted("knit-01")).toBe(true);
    // 2. By wishlist row UUID
    expect(wishlistStore.isWishlisted("wishlist-row-uuid-1")).toBe(true);
    // 3. By backend valid UUID
    expect(wishlistStore.isWishlisted("6b6e6974-2d30-4310-a000-000000000000")).toBe(true);
    // 4. By lowercase slug
    expect(wishlistStore.isWishlisted("chunky-hand-knit-merino-wool-blanket")).toBe(true);
    // 5. By uppercase SKU
    expect(wishlistStore.isWishlisted("CHUNKY-HAND-KNIT-MERINO-WOOL-BLANKET")).toBe(true);
    // 6. By product object (ProductSummary / ProductDetail representation)
    expect(
      wishlistStore.isWishlisted({
        id: "knit-01",
        title: "Chunky Hand-Knit Merino Wool Blanket",
        price: 189.99,
        slug: "chunky-hand-knit-merino-wool-blanket",
      })
    ).toBe(true);
  });

  it("prompts login when guest toggles wishlist", async () => {
    await wishlistStore.toggleWishlist({
      id: "prod-1",
      title: "Test Keyboard",
      price: 1000,
    });

    expect(authStore.isAuthModalOpen()).toBe(true);
    expect(authStore.pendingAction()).not.toBeNull();
  });

  it("toggles wishlist correctly: adds when not wishlisted and removes when wishlisted", async () => {
    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "accessToken").mockReturnValue("mock-token");

    const mockItem = {
      id: "w-item-uuid-99",
      productId: "6b6e6974-2d30-4310-a000-000000000000",
      sku: "CHUNKY-HAND-KNIT-MERINO-WOOL-BLANKET",
      title: "Chunky Hand-Knit Merino Wool Blanket",
      price: 189.99,
      imageUrl: "https://example.com/knit.jpg",
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    const addSpy = vi.spyOn(wishlistApi, "addToWishlistApi").mockResolvedValue(mockItem);
    const removeSpy = vi.spyOn(wishlistApi, "removeFromWishlistApi").mockResolvedValue();

    const productInput = {
      id: "knit-01",
      title: "Chunky Hand-Knit Merino Wool Blanket",
      price: 189.99,
      slug: "chunky-hand-knit-merino-wool-blanket",
    };

    // First click: Add
    expect(wishlistStore.isWishlisted(productInput)).toBe(false);
    const addResult = await wishlistStore.toggleWishlist(productInput);
    expect(addResult).toBe(true);
    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).not.toHaveBeenCalled();
    expect(wishlistStore.isWishlisted(productInput)).toBe(true);
    expect(wishlistStore.totalCount()).toBe(1);

    // Second click: Remove (calls different code path and sends correct wishlist item ID)
    const removeResult = await wishlistStore.toggleWishlist(productInput);
    expect(removeResult).toBe(true);
    expect(removeSpy).toHaveBeenCalledWith("w-item-uuid-99", "mock-token");
    expect(wishlistStore.isWishlisted(productInput)).toBe(false);
    expect(wishlistStore.totalCount()).toBe(0);
  });

  it("rolls back UI state and displays error toast when removal API fails", async () => {
    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "accessToken").mockReturnValue("mock-token");
    const toastSpy = vi.spyOn(authStore, "showToast");

    const mockItem = {
      id: "w-fail-test-id",
      productId: "6b6e6974-2d30-4310-a000-000000000000",
      sku: "CHUNKY-HAND-KNIT-MERINO-WOOL-BLANKET",
      title: "Chunky Hand-Knit Merino Wool Blanket",
      price: 189.99,
      imageUrl: "https://example.com/knit.jpg",
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(wishlistApi, "addToWishlistApi").mockResolvedValue(mockItem);
    // Mock API failure on remove
    vi.spyOn(wishlistApi, "removeFromWishlistApi").mockRejectedValue(new Error("Server error 500"));

    const productInput = {
      id: "knit-01",
      title: "Chunky Hand-Knit Merino Wool Blanket",
      price: 189.99,
      slug: "chunky-hand-knit-merino-wool-blanket",
    };

    // Add item first
    await wishlistStore.addToWishlist(productInput);
    expect(wishlistStore.isWishlisted(productInput)).toBe(true);
    expect(wishlistStore.totalCount()).toBe(1);

    // Attempt removal which fails
    const removeSuccess = await wishlistStore.removeFromWishlist(productInput);
    expect(removeSuccess).toBe(false);

    // Optimistic rollback verification:
    // UI state must NOT show false removed state
    expect(wishlistStore.isWishlisted(productInput)).toBe(true);
    expect(wishlistStore.totalCount()).toBe(1);
    expect(wishlistStore.items()).toHaveLength(1);
    expect(wishlistStore.items()[0].id).toBe("w-fail-test-id");
    expect(toastSpy).toHaveBeenCalledWith("Server error 500");
  });

  it("removes item from WishlistTab by WishlistItem object or id", async () => {
    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "accessToken").mockReturnValue("mock-token");

    const mockItem = {
      id: "w-tab-test-id",
      productId: "c1f76d20-8e10-48e2-9b2f-4a0b271e8c91",
      sku: "HANDMADE-SCARF",
      title: "Handmade Scarf",
      price: 49.99,
      imageUrl: "https://example.com/scarf.jpg",
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(wishlistApi, "addToWishlistApi").mockResolvedValue(mockItem);
    const removeSpy = vi.spyOn(wishlistApi, "removeFromWishlistApi").mockResolvedValue();

    await wishlistStore.addToWishlist({
      id: mockItem.productId,
      title: mockItem.title,
      price: mockItem.price,
      sku: mockItem.sku,
    });

    expect(wishlistStore.totalCount()).toBe(1);

    // Removing using the WishlistItem object (as passed from WishlistTab)
    const success = await wishlistStore.removeFromWishlist(mockItem);
    expect(success).toBe(true);
    expect(removeSpy).toHaveBeenCalledWith("w-tab-test-id", "mock-token");
    expect(wishlistStore.totalCount()).toBe(0);
    expect(wishlistStore.isWishlisted(mockItem.productId)).toBe(false);
  });

  it("prevents adding more than 12 items to wishlist", async () => {
    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "accessToken").mockReturnValue("mock-token");
    const toastSpy = vi.spyOn(authStore, "showToast");

    vi.spyOn(wishlistApi, "addToWishlistApi").mockImplementation(async (req) => ({
      id: `w-${req.sku}`,
      productId: req.productId,
      sku: req.sku,
      title: req.title,
      price: req.price,
      imageUrl: req.imageUrl || "",
      inStock: true,
      createdAt: new Date().toISOString(),
    }));

    for (let i = 1; i <= 12; i++) {
      await wishlistStore.addToWishlist({
        id: `prod-${i}`,
        title: `Product ${i}`,
        price: 100 * i,
        sku: `SKU-${i}`,
      });
    }

    expect(wishlistStore.totalCount()).toBe(12);

    // 13th item should be blocked
    await wishlistStore.addToWishlist({
      id: "prod-13",
      title: "Product 13",
      price: 1300,
      sku: "SKU-13",
    });

    expect(wishlistStore.totalCount()).toBe(12);
    expect(toastSpy).toHaveBeenCalledWith("Wishlist limit reached (maximum 12 items)");
  });
});
