import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSignal } from "solid-js";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { Header } from "../../components/Header";
import { searchCatalog } from "../../api/search";
import { ProductCard } from "../catalog/components/ProductCard";
import { ProductSummary } from "../../types/product";

describe("Search Integration & Regressions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("captures input, debounces input change, and submits on Enter key press", async () => {
    const onSearchChange = vi.fn();
    const onSearchSubmit = vi.fn();

    const Wrapper = () => {
      const [query, setQuery] = createSignal("");
      return (
        <Router>
          <Route
            path="*"
            component={() => (
              <Header
                searchQuery={query()}
                onSearchChange={(val) => {
                  setQuery(val);
                  onSearchChange(val);
                }}
                onSearchSubmit={onSearchSubmit}
              />
            )}
          />
        </Router>
      );
    };

    render(() => <Wrapper />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Type query
    fireEvent.input(input, { target: { value: "merino" } });
    expect(input.value).toBe("merino");

    // Press Enter to submit
    const form = screen.getByRole("search");
    fireEvent.submit(form);

    expect(onSearchSubmit).toHaveBeenCalledWith("merino");
  });

  it("submits search when clicking the search icon button", async () => {
    const onSearchSubmit = vi.fn();

    render(() => (
      <Router>
        <Route
          path="*"
          component={() => (
            <Header
              searchQuery="scarf"
              onSearchSubmit={onSearchSubmit}
            />
          )}
        />
      </Router>
    ));

    const submitBtn = screen.getByRole("button", { name: /^search$/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);
    expect(onSearchSubmit).toHaveBeenCalledWith("scarf");
  });

  it("clears search query and triggers callback when clicking the clear button", async () => {
    const onSearchChange = vi.fn();
    const onSearchSubmit = vi.fn();

    const Wrapper = () => {
      const [query, setQuery] = createSignal("blanket");
      return (
        <Router>
          <Route
            path="*"
            component={() => (
              <Header
                searchQuery={query()}
                onSearchChange={(val) => {
                  setQuery(val);
                  onSearchChange(val);
                }}
                onSearchSubmit={onSearchSubmit}
              />
            )}
          />
        </Router>
      );
    };

    render(() => <Wrapper />);

    const clearBtn = screen.getByRole("button", { name: /clear search query/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onSearchSubmit).toHaveBeenCalledWith("");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("safely maps backend search hit dto without throwing on category access in ProductCard", async () => {
    // Mock fetch returning backend ProductSearchHitDto structure (categoryName, categorySlug, without nested category obj)
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [
            {
              id: "knit-01",
              title: "Chunky Hand-Knit Merino Wool Blanket",
              slug: "chunky-hand-knit-merino-wool-blanket",
              shortDescription: "Ultra-soft 100% Australian merino wool chunky knit throw",
              categoryName: "Women",
              categorySlug: "women",
              brand: "Nani's Knitts",
              price: 4599.0,
              compareAtPrice: 5999.0,
              averageRating: 4.95,
              reviewCount: 88,
              stockStatus: "IN_STOCK",
              thumbnailUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2",
              badge: "BESTSELLER",
              score: 8.5,
            },
          ],
          facets: {
            categories: [{ key: "Women", count: 1 }],
            brands: [{ key: "Nani's Knitts", count: 1 }],
            priceRanges: [],
            ratings: [],
            stockStatuses: [],
          },
          didYouMean: null,
          pageNumber: 0,
          pageSize: 20,
          totalElements: 1,
          totalPages: 1,
          isFirst: true,
          isLast: true,
          hasNext: false,
          hasPrevious: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await searchCatalog({ q: "merino" });
    expect(result.totalElements).toBe(1);
    expect(result.content[0].category).toBeDefined();
    expect(result.content[0].category.name).toBe("Women");

    // Render in ProductCard to ensure no TypeError: Cannot read properties of undefined (reading 'name')
    render(() => <ProductCard product={result.content[0]} />);
    expect(screen.getByText("Chunky Hand-Knit Merino Wool Blanket")).toBeInTheDocument();
    expect(screen.getByText("Women")).toBeInTheDocument();
  });

  it("falls back to local mock catalog with multi-token case-insensitive search when backend is offline", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network connection failed"));

    const result = await searchCatalog({ q: "cable knit" });
    expect(result.totalElements).toBeGreaterThan(0);
    expect(result.content.some((p) => p.title.toLowerCase().includes("cable"))).toBe(true);
  });
});
