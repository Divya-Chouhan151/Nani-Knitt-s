import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { SearchFacetSidebar } from "./components/SearchFacetSidebar";
import { SearchFacets } from "../../api/search";

describe("SearchFacetSidebar", () => {
  const mockFacets: SearchFacets = {
    categories: [
      { key: "Women", count: 10 },
      { key: "Men", count: 5 },
      { key: "Kids", count: 3 },
    ],
    brands: [
      { key: "AuraWorks", count: 8 },
      { key: "Keychron", count: 4 },
    ],
    priceRanges: [
      { key: "Under ₹5,000", count: 3, from: 0, to: 5000 },
      { key: "₹5,000 - ₹15,000", count: 7, from: 5000, to: 15000 },
    ],
    ratings: [
      { key: "4.5 & up", count: 6, from: 4.5 },
    ],
    stockStatuses: [
      { key: "IN_STOCK", count: 12 },
    ],
  };

  it("renders facet categories (Men, Women, Kids) and handles selection", () => {
    const onSelectCategory = vi.fn();

    render(() => (
      <SearchFacetSidebar
        facets={mockFacets}
        inStockOnly={false}
        onSelectCategory={onSelectCategory}
        onSelectBrand={() => {}}
        onSelectPriceRange={() => {}}
        onSelectMinRating={() => {}}
        onToggleInStock={() => {}}
        onResetFilters={() => {}}
        activeFilterCount={0}
      />
    ));

    expect(screen.getByText("Women")).toBeInTheDocument();
    expect(screen.getByText("Men")).toBeInTheDocument();
    expect(screen.getByText("Kids")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Women"));
    expect(onSelectCategory).toHaveBeenCalledWith("Women");
  });

  it("renders active filter count badge and reset button", () => {
    const onResetFilters = vi.fn();

    render(() => (
      <SearchFacetSidebar
        facets={mockFacets}
        inStockOnly={true}
        onSelectCategory={() => {}}
        onSelectBrand={() => {}}
        onSelectPriceRange={() => {}}
        onSelectMinRating={() => {}}
        onToggleInStock={() => {}}
        onResetFilters={onResetFilters}
        activeFilterCount={2}
      />
    ));

    expect(screen.getByText("2")).toBeInTheDocument();
    const resetBtn = screen.getByText("Reset All");
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalled();
  });

  it("renders sort by dropdown and triggers onSortChange", () => {
    const onSortChange = vi.fn();

    render(() => (
      <SearchFacetSidebar
        facets={mockFacets}
        sort="newest"
        onSortChange={onSortChange}
        onSelectCategory={() => {}}
        onSelectBrand={() => {}}
        onSelectPriceRange={() => {}}
        onSelectMinRating={() => {}}
        onResetFilters={() => {}}
        activeFilterCount={0}
      />
    ));

    const sortSelect = screen.getByRole("combobox", { name: /Sort by/i });
    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect).toHaveValue("newest");

    fireEvent.change(sortSelect, { target: { value: "price_asc" } });
    expect(onSortChange).toHaveBeenCalledWith("price_asc");
  });

  it("strictly limits category options to Men, Women, Kids and strips out all other verticals", () => {
    const rawCategoriesWithForeignVerticals = [
      { name: "Electronics", slug: "electronics", count: 20 },
      { name: "Woodwork", slug: "woodwork", count: 15 },
      { name: "Women", slug: "women", count: 7 },
      { name: "Men", slug: "men", count: 6 },
      { name: "Kids", slug: "kids", count: 5 },
      { name: "Home Decor", slug: "home-decor", count: 12 },
    ];

    render(() => (
      <SearchFacetSidebar
        categories={rawCategoriesWithForeignVerticals}
        onSelectCategory={() => {}}
        onSelectPriceRange={() => {}}
        onSelectMinRating={() => {}}
        onResetFilters={() => {}}
        activeFilterCount={0}
      />
    ));

    expect(screen.getByText("Men")).toBeInTheDocument();
    expect(screen.getByText("Women")).toBeInTheDocument();
    expect(screen.getByText("Kids")).toBeInTheDocument();

    expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    expect(screen.queryByText("Woodwork")).not.toBeInTheDocument();
    expect(screen.queryByText("Home Decor")).not.toBeInTheDocument();
  });
});
