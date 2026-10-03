# Frontend Implementation Plan: E-Commerce Catalog Landing Page

This document specifies the architecture, component hierarchy, reactivity model, styling tokens, and testing strategy for the e-commerce storefront landing page using **SolidJS**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 1. Overview & Core Principles

The landing page follows a **catalog-first** design pattern: customers immediately encounter the product discovery experience with minimal fluff.

### Architecture Guidelines (from `frontend/AGENTS.md`)
- **Fine-grained reactivity**: Components run once. Only reactive signals, memos, and store properties trigger DOM updates. Never rely on full component re-rendering.
- **Never destructure props**: Always access `props.foo` to maintain reactive tracking getters.
- **Solid control flow**: Exclusively use `<Show>`, `<For>`, `<Switch>`, and `<Match>` rather than JSX ternaries and `.map()`.
- **Async data handling**: Use `createResource` paired with `<Suspense>` boundaries for network fetching; avoid manual `isLoading` tracking for read requests.
- **Color tokens**: Strictly utilize the CSS custom properties defined in `frontend/COLOR-TOKENS.md` mapped via Tailwind utilities.

---

## 2. Page Layout & Wireframe Architecture

The landing page is composed of five primary visual zones:

```
+-----------------------------------------------------------------------------------+
| 1. Sticky Header: Brand Logo | Global Search Bar | Category Quick-Links | Cart/Theme|
+-----------------------------------------------------------------------------------+
| 2. Hero Micro-Banner: Curated Campaign / Announcement (Collapsible)               |
+-----------------------------------------------------------------------------------+
| 3. Main Workspace Container:                                                      |
|   +--------------------------+  +-----------------------------------------------+ |
|   | 3a. Sidebar Filters      |  | 3b. Product Catalog Workspace                 | |
|   |   - Category Hierarchy   |  |   - Toolbar: Active Filters, Count, Sort, Grid| |
|   |   - Price Range Slider   |  |   - Suspense Container:                       | |
|   |   - Minimum Rating (1-5★)|  |     * Loading Skeletons                       | |
|   |   - In-Stock Only Toggle |  |     * Responsive Product Grid (2 / 3 / 4 col) | |
|   |   - Reset Filters Button |  |     * Empty / Error Fallback State            | |
|   |                          |  |   - Pagination & Page Size Selector           | |
|   +--------------------------+  +-----------------------------------------------+ |
+-----------------------------------------------------------------------------------+
| 4. Footer: Trust badges, navigation links, copyright                              |
+-----------------------------------------------------------------------------------+
```

---

## 3. Component Breakdown & Responsibilities

### 3.1 Layout & Navigation
- **`Header`** (`src/components/Header.tsx`):
  - Sticky at top (`sticky top-0 z-40 bg-[var(--bg-page)]/80 backdrop-blur-md border-b border-[var(--border)]`).
  - Brand identity logo.
  - Global search bar with debounced input (300ms) updating the reactive `searchQuery` signal.
  - Quick access actions: Dark/light mode theme toggle (switches `[data-theme="dark"]` attribute on `document.documentElement`), Cart indicator preview.

- **`PromoRibbon`** (`src/features/catalog/components/PromoRibbon.tsx`):
  - Decorative background rotating `--bg-section-a` and `--bg-section-b`.
  - Highlights seasonal promotions or free shipping thresholds.

### 3.2 Filtering & Facets
- **`SidebarFilters`** (`src/features/catalog/components/SidebarFilters.tsx`):
  - Sticky sidebar desktop (`w-64 shrink-0 hidden md:block`), off-canvas drawer on mobile.
  - **Category Tree**: Nested list using `<For each={categories()}>` with active category highlight (`text-[var(--brand-600)] font-semibold`).
  - **Price Range Filter**: Min/Max numeric inputs + dual-range visual track.
  - **Rating Filter**: Star ratings (4★ & up, 3★ & up) with radio/checkbox options.
  - **Stock Filter**: Toggle switch for "In stock only".
  - **Clear Filters Action**: Resets all query parameters to default.

### 3.3 Catalog Workspace & Toolbar
- **`ProductToolbar`** (`src/features/catalog/components/ProductToolbar.tsx`):
  - Total products matching criteria count (`createMemo(() => data()?.totalElements || 0)`).
  - Active filter chips with remove (`×`) actions.
  - Sorting dropdown:
    - `price_asc` (Price: Low to High)
    - `price_desc` (Price: High to Low)
    - `newest` (Newest Arrivals)
    - `rating_desc` (Customer Rating)
  - Grid density switcher (compact vs comfortable).

- **`ProductGrid`** (`src/features/catalog/components/ProductGrid.tsx`):
  - Wrapped in `<Suspense fallback={<ProductGridSkeleton count={8} />}>`.
  - CSS Grid with responsive columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
  - `<For each={products()}>`: Efficient fine-grained rendering without keyed re-mounts.
  - Fallback `<ProductEmptyState>` when `totalElements === 0`.

- **`ProductCard`** (`src/features/catalog/components/ProductCard.tsx`):
  - Background surface `bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`.
  - **Image Container**: Aspect ratio `aspect-square`, rounded corners, `loading="lazy"`, object-cover with subtle zoom on hover.
  - **Discount Badge**: `<Show when={hasDiscount(props.product)}>`, styled with `bg-[var(--brand-100)] text-[var(--text-primary)] text-xs font-bold px-2 py-1 rounded-full`.
  - **Stock Indicator**: In-stock/Low-stock dot with semantic color (`var(--success)` / `var(--warning)`).
  - **Category tag**: Subtle subtitle text `text-[var(--text-secondary)] text-xs uppercase tracking-wider`.
  - **Title**: Multi-line clamp (`line-clamp-2`), `font-medium text-[var(--text-primary)] hover:text-[var(--brand-600)]`.
  - **Rating & Reviews**: Star rating glyphs (`★`), numeric average (e.g. `4.8`), and review count in parentheses (`(124)`).
  - **Pricing Block**:
    - Current price formatted with locale currency (`font-bold text-lg text-[var(--text-primary)]`).
    - Compare-at price (`line-through text-sm text-[var(--text-secondary)]`).
  - **CTA Button**: Quick "Add to Cart" button using `bg-[var(--brand-600)] text-[var(--text-on-brand)] hover:bg-[var(--brand-700)] rounded-xl py-2 px-3`.

- **`Pagination`** (`src/features/catalog/components/Pagination.tsx`):
  - Current page, total pages, previous/next controls, and page number buttons.
  - Page size selector (`12`, `24`, `48` items per page).

---

## 4. Reactive State Management

In accordance with SolidJS architecture, reactive state is split between local URL-synchronized query parameters and remote resources:

```typescript
// src/features/catalog/stores/catalogFilterStore.ts
import { createSignal } from "solid-js";

export interface CatalogFilterState {
  page: number;
  size: number;
  sort: string;
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
}

export function createCatalogFilters() {
  const [filters, setFilters] = createSignal<CatalogFilterState>({
    page: 0,
    size: 24,
    sort: "newest",
    inStockOnly: false
  });

  const setPage = (page: number) => setFilters(prev => ({ ...prev, page }));
  const setSort = (sort: string) => setFilters(prev => ({ ...prev, sort, page: 0 }));
  const setCategory = (slug?: string) => setFilters(prev => ({ ...prev, categorySlug: slug, page: 0 }));
  const setQuery = (query?: string) => setFilters(prev => ({ ...prev, query, page: 0 }));
  const setPriceRange = (min?: number, max?: number) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 0 }));
  const setMinRating = (rating?: number) => setFilters(prev => ({ ...prev, minRating: rating, page: 0 }));
  const setInStock = (inStock: boolean) => setFilters(prev => ({ ...prev, inStockOnly: inStock, page: 0 }));
  const resetFilters = () => setFilters({ page: 0, size: 24, sort: "newest", inStockOnly: false });

  return { filters, setPage, setSort, setCategory, setQuery, setPriceRange, setMinRating, setInStock, resetFilters };
}
```

### Data Fetching via `createResource`
```typescript
// Inside CatalogPage.tsx
const { filters, ...filterActions } = createCatalogFilters();

// Product list resource auto-refetches whenever filters() signal changes
const [productsData] = createResource(filters, fetchProducts);

// Categories tree resource for sidebar
const [categoriesData] = createResource(() => ({ tree: true }), fetchCategories);

// Facets resource for price bounds and rating counts
const [facetsData] = createResource(
  () => ({ categorySlug: filters().categorySlug, query: filters().query }),
  fetchProductFacets
);
```

---

## 5. Directory Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # Fetch client with base URL, error mapping, timeout
│   │   ├── products.ts            # getProducts, getProductByIdOrSlug, getFeaturedProducts, getFacets
│   │   └── categories.ts          # getCategories
│   ├── assets/
│   ├── components/                # Reusable dumb UI widgets
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── RatingStars.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── features/
│   │   └── catalog/               # Product catalog feature module
│   │       ├── components/
│   │       │   ├── PromoRibbon.tsx
│   │       │   ├── SidebarFilters.tsx
│   │       │   ├── CategoryFilterTree.tsx
│   │       │   ├── PriceSlider.tsx
│   │       │   ├── RatingFilter.tsx
│   │       │   ├── ProductToolbar.tsx
│   │       │   ├── ProductGrid.tsx
│   │       │   ├── ProductCard.tsx
│   │       │   ├── ProductGridSkeleton.tsx
│   │       │   ├── ProductEmptyState.tsx
│   │       │   └── Pagination.tsx
│   │       └── stores/
│   │           └── catalogFilterStore.ts
│   ├── routes/
│   │   └── index.tsx              # Landing catalog page
│   ├── types/
│   │   ├── product.ts             # ProductSummary, ProductDetail, Variant, Facet
│   │   ├── category.ts            # Category, CategoryTreeNode
│   │   └── api.ts                 # PageResponse<T>, ApiError
│   ├── utils/
│   │   ├── currency.ts            # Format price (e.g. Intl.NumberFormat)
│   │   └── debounce.ts            # Search debounce utility
│   ├── App.tsx
│   ├── index.css                  # Tailwind imports + CSS tokens from COLOR-TOKENS.md
│   └── index.tsx
├── tailwind.config.js             # Configured with CSS variable palette
├── tsconfig.json
├── package.json
└── vite.config.ts
```

---

## 6. Color Tokens & Tailwind CSS Configuration

In `tailwind.config.js`, map semantic color variables to Tailwind classes:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        surface: "var(--bg-surface)",
        section: {
          a: "var(--bg-section-a)",
          b: "var(--bg-section-b)",
          info: "var(--bg-info)",
        },
        brand: {
          100: "var(--brand-100)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        "on-brand": "var(--text-on-brand)",
        border: "var(--border)",
        semantic: {
          success: "var(--success)",
          "success-text": "var(--success-text)",
          warning: "var(--warning)",
          "warning-text": "var(--warning-text)",
          danger: "var(--danger)",
          "danger-text": "var(--danger-text)",
          "info-text": "var(--info-text)",
        }
      }
    }
  },
  plugins: []
};
```

---

## 7. Testing Strategy

### 7.1 Unit & Component Tests (Vitest + `@solidjs/testing-library`)
- **`ProductCard.test.tsx`**:
  - Validates correct rendering of product title, formatted price, discount calculation.
  - Asserts that stars and review count display accurately.
  - Asserts that stock status badge reflects `in_stock` vs `low_stock` vs `out_of_stock`.
  - Asserts props are not destructured and reactivity responds to prop changes.
- **`SidebarFilters.test.tsx`**:
  - Tests emitting filter events (category selection, price change, rating click, reset).
- **`ProductToolbar.test.tsx`**:
  - Tests sort option selection and active filter badge removal.

### 7.2 End-to-End Tests (Playwright)
- **`catalog.spec.ts`**:
  - Verifies landing page renders with product grid.
  - Tests typing in search box filters the products.
  - Tests selecting a category filter updates the URL and product count.
  - Tests pagination navigation between pages.
  - Tests dark mode toggle switches theme without styling breakage.
