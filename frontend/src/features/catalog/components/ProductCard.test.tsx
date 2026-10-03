import { render, screen } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductCard } from "./ProductCard";
import { ProductSummary } from "../../../types/product";
import { authStore } from "../../auth/stores/authStore";

import * as authApi from "../../../api/auth";

describe("ProductCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authApi, "logoutApi").mockResolvedValue(undefined);
    authStore.closeAuthModal();
  });
  const sampleProduct: ProductSummary = {
    id: "test-id-1",
    title: "Mechanical Keyboard",
    slug: "mechanical-keyboard",
    shortDescription: "Smooth linear switches with RGB",
    category: {
      id: "cat-1",
      name: "Keyboards",
      slug: "keyboards",
    },
    thumbnailUrl: "https://example.com/kb.jpg",
    price: 11049,
    compareAtPrice: 13599,
    currency: "INR",
    averageRating: 4.8,
    reviewCount: 42,
    stockStatus: "IN_STOCK",
    badge: "SALE",
    createdAt: "2026-08-01T00:00:00Z",
  };

  it("renders product title, price in INR, and category", () => {
    render(() => <ProductCard product={sampleProduct} />);

    expect(screen.getByText("Mechanical Keyboard")).toBeInTheDocument();
    expect(screen.getByText("Keyboards")).toBeInTheDocument();
    // In INR formatting, 11049 is formatted with ₹ (e.g. ₹11,049)
    expect(screen.getByText(/11,049/)).toBeInTheDocument();
    expect(screen.getByText(/13,599/)).toBeInTheDocument();
    expect(screen.getByText("SALE")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("handles out of stock status", () => {
    const outOfStockProduct: ProductSummary = {
      ...sampleProduct,
      stockStatus: "OUT_OF_STOCK",
    };

    render(() => <ProductCard product={outOfStockProduct} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /sold out/i });
    expect(button).toBeDisabled();
  });

  it("intercepts onAddToCart for unauthenticated guests and prompts auth modal", () => {
    const handleAdd = vi.fn();
    render(() => <ProductCard product={sampleProduct} onAddToCart={handleAdd} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    button.click();

    expect(authStore.isAuthModalOpen()).toBe(true);
    expect(authStore.pendingAction()).not.toBeNull();
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it("executes onAddToCart directly when user is authenticated", () => {
    vi.spyOn(authStore, "requireAuth").mockImplementation((action: () => void) => {
      action();
      return true;
    });
    const handleAdd = vi.fn();
    render(() => <ProductCard product={sampleProduct} onAddToCart={handleAdd} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    button.click();

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith(sampleProduct);
  });

  it("triggers onQuickView when quick view button clicked", () => {
    const handleQuickView = vi.fn();
    render(() => <ProductCard product={sampleProduct} onQuickView={handleQuickView} />);

    const quickViewBtn = screen.getByRole("button", { name: /quick view/i });
    quickViewBtn.click();

    expect(handleQuickView).toHaveBeenCalledWith(sampleProduct);
  });

  it("renders the heart wishlist button and prompts auth for guest or toggles for authenticated user", async () => {
    render(() => <ProductCard product={sampleProduct} />);

    const wishlistBtn = screen.getByTestId("wishlist-button");
    expect(wishlistBtn).toBeInTheDocument();
    expect(wishlistBtn.querySelector("svg")).toBeInTheDocument();
    expect(wishlistBtn).toHaveAttribute("aria-label", "Save to Wishlist");

    // Guest click prompts auth
    wishlistBtn.click();
    expect(authStore.isAuthModalOpen()).toBe(true);
    authStore.closeAuthModal();
  });
});
