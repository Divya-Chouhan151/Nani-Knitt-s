import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductCard } from "../catalog/components/ProductCard";
import { WishlistTab } from "./tabs/WishlistTab";
import { wishlistStore } from "./stores/wishlistStore";
import { authStore } from "../auth/stores/authStore";
import * as wishlistApi from "../../api/wishlist";
import * as authApi from "../../api/auth";
import { ProductSummary } from "../../types/product";

describe("Wishlist Removal Integration across Entry Points", () => {
  const sampleProduct: ProductSummary = {
    id: "knit-01",
    title: "Chunky Hand-Knit Merino Wool Blanket",
    slug: "chunky-hand-knit-merino-wool-blanket",
    shortDescription: "Ultra-soft 100% Australian merino wool throw",
    category: {
      id: "cat-women",
      name: "Women",
      slug: "women",
    },
    thumbnailUrl: "https://example.com/knit-01.jpg",
    price: 189.99,
    compareAtPrice: 229.99,
    currency: "INR",
    averageRating: 4.9,
    reviewCount: 38,
    stockStatus: "IN_STOCK",
    badge: "BESTSELLER",
    createdAt: "2026-08-01T00:00:00Z",
  };

  const wishlistItem = {
    id: "wishlist-uuid-101",
    productId: "6b6e6974-2d30-4310-a000-000000000000",
    sku: "CHUNKY-HAND-KNIT-MERINO-WOOL-BLANKET",
    title: "Chunky Hand-Knit Merino Wool Blanket",
    price: 189.99,
    imageUrl: "https://example.com/knit-01.jpg",
    inStock: true,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authApi, "logoutApi").mockResolvedValue(undefined);
    wishlistStore.clearWishlist();
    authStore.closeAuthModal();

    vi.spyOn(authStore, "isAuthenticated").mockReturnValue(true);
    vi.spyOn(authStore, "accessToken").mockReturnValue("test-mock-token");
    vi.spyOn(authStore, "requireAuth").mockImplementation((action: () => void) => {
      action();
      return true;
    });
  });

  it("successfully removes an item when heart is clicked on ProductCard grid and decrements count", async () => {
    // 1. Seed store with the wishlisted item
    vi.spyOn(wishlistApi, "addToWishlistApi").mockResolvedValue(wishlistItem);
    const removeSpy = vi.spyOn(wishlistApi, "removeFromWishlistApi").mockResolvedValue();

    await wishlistStore.addToWishlist(sampleProduct);
    expect(wishlistStore.isWishlisted(sampleProduct)).toBe(true);
    expect(wishlistStore.totalCount()).toBe(1);

    // 2. Render ProductCard with the item wishlisted
    render(() => <ProductCard product={sampleProduct} />);

    const heartBtn = screen.getByTestId("wishlist-button");
    expect(heartBtn).toHaveAttribute("aria-label", "In Wishlist");
    const svgIcon = heartBtn.querySelector("svg");
    expect(svgIcon?.getAttribute("class")).toContain("fill-rose-500");

    // 3. Click heart button to remove
    fireEvent.click(heartBtn);

    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalledWith("wishlist-uuid-101", "test-mock-token");
      expect(wishlistStore.isWishlisted(sampleProduct)).toBe(false);
      expect(wishlistStore.totalCount()).toBe(0);
    });

    // 4. Verify heart icon reverted to outline
    expect(heartBtn).toHaveAttribute("aria-label", "Save to Wishlist");
    expect(svgIcon?.getAttribute("class")).toContain("fill-none");
  });

  it("successfully removes an item from WishlistTab and disappears immediately from list", async () => {
    vi.spyOn(wishlistApi, "fetchWishlistApi").mockResolvedValue([wishlistItem]);
    const removeSpy = vi.spyOn(wishlistApi, "removeFromWishlistApi").mockResolvedValue();

    render(() => <WishlistTab />);

    await waitFor(() => {
      expect(screen.getByText("Chunky Hand-Knit Merino Wool Blanket")).toBeInTheDocument();
      expect(screen.getByText("1 Items Saved")).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole("button", { name: /remove from wishlist/i });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalledWith("wishlist-uuid-101", "test-mock-token");
      expect(wishlistStore.totalCount()).toBe(0);
      expect(wishlistStore.isWishlisted(sampleProduct)).toBe(false);
    });

    // Verify empty state is now displayed
    expect(screen.queryByText("Chunky Hand-Knit Merino Wool Blanket")).not.toBeInTheDocument();
    expect(screen.getByText("Your wishlist is waiting for a story")).toBeInTheDocument();
    expect(screen.getByText("0 Items Saved")).toBeInTheDocument();
  });

  it("rolls back state when removal API fails and alerts the user without showing false removed state", async () => {
    vi.spyOn(wishlistApi, "fetchWishlistApi").mockResolvedValue([wishlistItem]);
    vi.spyOn(wishlistApi, "removeFromWishlistApi").mockRejectedValue(new Error("Network connection dropped"));
    const toastSpy = vi.spyOn(authStore, "showToast");

    await wishlistStore.loadWishlist();
    expect(wishlistStore.isWishlisted(sampleProduct)).toBe(true);

    render(() => <ProductCard product={sampleProduct} />);
    const heartBtn = screen.getByTestId("wishlist-button");
    const svgIcon = heartBtn.querySelector("svg");

    fireEvent.click(heartBtn);

    await waitFor(() => {
      // Must have displayed error toast
      expect(toastSpy).toHaveBeenCalledWith("Network connection dropped");
      // Must have rolled back: item remains wishlisted
      expect(wishlistStore.isWishlisted(sampleProduct)).toBe(true);
      expect(wishlistStore.totalCount()).toBe(1);
    });

    // Heart icon must still show filled/wishlisted state (no false removed state)
    expect(heartBtn).toHaveAttribute("aria-label", "In Wishlist");
    expect(svgIcon?.getAttribute("class")).toContain("fill-rose-500");
  });
});
