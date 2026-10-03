import { createSignal, For, Show } from "solid-js";
import { SearchFacets } from "../../../api/search";
import { localeStore } from "../../../stores/localeStore";

export interface ColorFacet {
  name: string;
  hex: string;
  count: number;
}

export interface TypeFacet {
  name: string;
  count: number;
}

export interface CategoryFacet {
  name: string;
  slug: string;
  count: number;
}

export interface SearchFacetSidebarProps {
  facets?: SearchFacets;
  categories?: CategoryFacet[];
  colors?: ColorFacet[];
  productTypes?: TypeFacet[];
  selectedCategory?: string;
  selectedBrand?: string;
  selectedColor?: string;
  selectedProductType?: string;
  selectedMinPrice?: number;
  selectedMaxPrice?: number;
  selectedMinRating?: number;
  sort?: string;
  onSortChange?: (sort: string) => void;
  onSelectCategory: (cat?: string) => void;
  onSelectBrand?: (brand?: string) => void;
  onSelectColor?: (color?: string) => void;
  onSelectProductType?: (type?: string) => void;
  onSelectPriceRange: (min?: number, max?: number) => void;
  onSelectMinRating: (rating?: number) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  isMobileDrawer?: boolean;
  onApplyMobile?: () => void;
  inStockOnly?: boolean;
  onToggleInStock?: (inStock: boolean) => void;
}

export function SearchFacetSidebar(props: SearchFacetSidebarProps) {
  // Collapsible section toggles
  const [isCategoryOpen, setIsCategoryOpen] = createSignal(true);
  const [isColorOpen, setIsColorOpen] = createSignal(true);
  const [isTypeOpen, setIsTypeOpen] = createSignal(true);
  const [isPriceOpen, setIsPriceOpen] = createSignal(true);
  const [isRatingOpen, setIsRatingOpen] = createSignal(true);

  // Permitted category facets for handmade knitwear marketplace: strictly Men, Women, Kids
  const ALLOWED_CATEGORIES = ["Men", "Women", "Kids"] as const;

  // Compute category list: strictly Men, Women, Kids
  const categoryList = () => {
    const counts: Record<string, number> = {
      men: 4,
      women: 5,
      kids: 3,
    };

    if (props.categories && props.categories.length > 0) {
      for (const c of props.categories) {
        const key = (c.slug || c.name).toLowerCase();
        if (counts[key] !== undefined) {
          counts[key] = c.count;
        }
      }
    } else if (props.facets?.categories && props.facets.categories.length > 0) {
      for (const fc of props.facets.categories) {
        const key = fc.key.toLowerCase();
        if (counts[key] !== undefined) {
          counts[key] = fc.count;
        }
      }
    }

    return ALLOWED_CATEGORIES.map((catName) => ({
      name: catName,
      slug: catName.toLowerCase(),
      count: counts[catName.toLowerCase()] ?? 0,
    }));
  };

  // Compute color list
  const colorList = () => {
    if (props.colors && props.colors.length > 0) {
      return props.colors;
    }
    return [
      { name: "Rose Pink", hex: "#f472b6", count: 2 },
      { name: "Mustard", hex: "#eab308", count: 2 },
      { name: "Forest Green", hex: "#15803d", count: 1 },
      { name: "Pastel Coral", hex: "#fb7185", count: 1 },
      { name: "Charcoal", hex: "#374151", count: 3 },
      { name: "Soft Lavender", hex: "#c084fc", count: 1 },
      { name: "Cream", hex: "#fef3c7", count: 2 },
      { name: "Natural", hex: "#d97706", count: 2 },
    ];
  };

  // Compute product type list
  const typeList = () => {
    if (props.productTypes && props.productTypes.length > 0) {
      return props.productTypes;
    }
    return [
      { name: "Blankets", count: 2 },
      { name: "Scarves", count: 1 },
      { name: "Sweaters", count: 1 },
      { name: "Toys", count: 1 },
      { name: "Caps", count: 1 },
      { name: "Socks", count: 1 },
      { name: "Shawls", count: 1 },
      { name: "Booties", count: 1 },
    ];
  };

  return (
    <aside class="w-full space-y-3.5 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs transition-all">
      {/* Header & Reset */}
      <div class="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
        <h3 class="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
          <span>{localeStore.t("filters.title")}</span>
          <Show when={props.activeFilterCount > 0}>
            <span class="px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
              {props.activeFilterCount}
            </span>
          </Show>
        </h3>
        <Show when={props.activeFilterCount > 0}>
          <button
            type="button"
            onClick={props.onResetFilters}
            class="text-[11px] text-[var(--brand-600)] hover:underline font-semibold"
          >
            {localeStore.t("filters.reset")}
          </button>
        </Show>
      </div>

      {/* Sort By Control */}
      <Show when={props.onSortChange}>
        <div class="space-y-1 pb-3 border-b border-[var(--border)]">
          <label class="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>{localeStore.t("catalog.sort_by")}</span>
            <span class="text-xs">↕️</span>
          </label>
          <select
            aria-label={localeStore.t("catalog.sort_by")}
            value={props.sort || "newest"}
            onChange={(e) => props.onSortChange?.(e.currentTarget.value)}
            class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl py-1.5 px-2.5 text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-2xs transition-colors cursor-pointer"
          >
            <option value="newest">{localeStore.t("catalog.newest")}</option>
            <option value="price_asc">{localeStore.t("catalog.price_asc")}</option>
            <option value="price_desc">{localeStore.t("catalog.price_desc")}</option>
            <option value="rating_desc">{localeStore.t("catalog.rating_desc")}</option>
            <option value="popularity">{localeStore.t("catalog.popularity")}</option>
          </select>
        </div>
      </Show>

      {/* 1. Category Facet (Collapsible) */}
      <div class="space-y-1.5 pt-1">
        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen())}
          class="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-0.5"
        >
          <span class="flex items-center gap-1.5">
            <span>Category</span>
            <Show when={props.selectedCategory}>
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--brand-600)]" />
            </Show>
          </span>
          <span class="text-xs">{isCategoryOpen() ? "▾" : "▸"}</span>
        </button>

        <Show when={isCategoryOpen()}>
          <div class="space-y-0.5 max-h-44 overflow-y-auto pr-1 animate-in fade-in duration-150">
            <For each={categoryList()}>
              {(cat) => {
                const isSelected =
                  props.selectedCategory?.toLowerCase() === cat.slug.toLowerCase() ||
                  props.selectedCategory?.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    type="button"
                    onClick={() => props.onSelectCategory(isSelected ? undefined : cat.name)}
                    class={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-[var(--brand-50)] dark:bg-[var(--brand-950)] text-[var(--brand-600)] font-bold"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-section-a)]"
                    }`}
                  >
                    <span class="truncate">{cat.name}</span>
                    <span class="text-[10px] text-[var(--text-secondary)] ml-2">
                      ({cat.count})
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* 2. Colour Facet (Collapsible with visual color swatches) */}
      <div class="space-y-1.5 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setIsColorOpen(!isColorOpen())}
          class="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-0.5"
        >
          <span class="flex items-center gap-1.5">
            <span>Colour</span>
            <Show when={props.selectedColor}>
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </Show>
          </span>
          <span class="text-xs">{isColorOpen() ? "▾" : "▸"}</span>
        </button>

        <Show when={isColorOpen()}>
          <div class="space-y-1 max-h-40 overflow-y-auto pr-1 animate-in fade-in duration-150">
            <For each={colorList()}>
              {(col) => {
                const isSelected = props.selectedColor?.toLowerCase() === col.name.toLowerCase();
                return (
                  <button
                    type="button"
                    onClick={() => props.onSelectColor?.(isSelected ? undefined : col.name)}
                    class={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-[var(--brand-50)] dark:bg-[var(--brand-950)] text-[var(--brand-600)] font-bold ring-1 ring-[var(--brand-500)]/40"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-section-a)]"
                    }`}
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span
                        class="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 shrink-0 shadow-2xs"
                        style={{ "background-color": col.hex }}
                        aria-hidden="true"
                      />
                      <span class="truncate">{col.name}</span>
                    </div>
                    <span class="text-[10px] text-[var(--text-secondary)] ml-2">
                      ({col.count})
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* 3. Product Type Facet (Collapsible) */}
      <div class="space-y-1.5 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setIsTypeOpen(!isTypeOpen())}
          class="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-0.5"
        >
          <span class="flex items-center gap-1.5">
            <span>Product Type</span>
            <Show when={props.selectedProductType}>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </Show>
          </span>
          <span class="text-xs">{isTypeOpen() ? "▾" : "▸"}</span>
        </button>

        <Show when={isTypeOpen()}>
          <div class="space-y-0.5 max-h-40 overflow-y-auto pr-1 animate-in fade-in duration-150">
            <For each={typeList()}>
              {(typ) => {
                const isSelected = props.selectedProductType?.toLowerCase() === typ.name.toLowerCase();
                return (
                  <button
                    type="button"
                    onClick={() => props.onSelectProductType?.(isSelected ? undefined : typ.name)}
                    class={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-[var(--brand-50)] dark:bg-[var(--brand-950)] text-[var(--brand-600)] font-bold"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-section-a)]"
                    }`}
                  >
                    <span class="truncate">{typ.name}</span>
                    <span class="text-[10px] text-[var(--text-secondary)] ml-2">
                      ({typ.count})
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* 4. Price Ranges (Collapsible) */}
      <div class="space-y-1.5 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen())}
          class="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-0.5"
        >
          <span class="flex items-center gap-1.5">
            <span>Price Range</span>
            <Show when={props.selectedMinPrice !== undefined || props.selectedMaxPrice !== undefined}>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </Show>
          </span>
          <span class="text-xs">{isPriceOpen() ? "▾" : "▸"}</span>
        </button>

        <Show when={isPriceOpen()}>
          <div class="space-y-0.5 animate-in fade-in duration-150">
            <For
              each={
                props.facets?.priceRanges || [
                  { key: "Under ₹2,000", count: 4, from: 0, to: 2000 },
                  { key: "₹2,000 - ₹5,000", count: 4, from: 2000, to: 5000 },
                  { key: "₹5,000 - ₹15,000", count: 4, from: 5000, to: 15000 },
                  { key: "Over ₹15,000", count: 2, from: 15000, to: undefined },
                ]
              }
            >
              {(range) => {
                const isSelected =
                  props.selectedMinPrice === (range.from ?? undefined) &&
                  props.selectedMaxPrice === (range.to ?? undefined);
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        props.onSelectPriceRange(undefined, undefined);
                      } else {
                        props.onSelectPriceRange(range.from ?? undefined, range.to ?? undefined);
                      }
                    }}
                    class={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-[var(--brand-50)] dark:bg-[var(--brand-950)] text-[var(--brand-600)] font-bold"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-section-a)]"
                    }`}
                  >
                    <span>{range.key}</span>
                    <span class="text-[10px] text-[var(--text-secondary)] ml-2">
                      ({range.count})
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* 5. Rating Facet (Collapsible) */}
      <div class="space-y-1.5 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setIsRatingOpen(!isRatingOpen())}
          class="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-0.5"
        >
          <span class="flex items-center gap-1.5">
            <span>Artisan Rating</span>
            <Show when={props.selectedMinRating}>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </Show>
          </span>
          <span class="text-xs">{isRatingOpen() ? "▾" : "▸"}</span>
        </button>

        <Show when={isRatingOpen()}>
          <div class="space-y-0.5 animate-in fade-in duration-150">
            <For
              each={
                props.facets?.ratings || [
                  { key: "4.8 & above", count: 8, from: 4.8 },
                  { key: "4.5 & above", count: 12, from: 4.5 },
                  { key: "4.0 & above", count: 14, from: 4.0 },
                ]
              }
            >
              {(rating) => {
                const isSelected = props.selectedMinRating === rating.from;
                return (
                  <button
                    type="button"
                    onClick={() => props.onSelectMinRating(isSelected ? undefined : rating.from)}
                    class={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-[var(--brand-50)] dark:bg-[var(--brand-950)] text-[var(--brand-600)] font-bold"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-section-a)]"
                    }`}
                  >
                    <span class="flex items-center gap-1.5">
                      <span class="text-amber-400">★</span>
                      <span>{rating.key}</span>
                    </span>
                    <span class="text-[10px] text-[var(--text-secondary)] ml-2">
                      ({rating.count})
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* Mobile Drawer Action Button */}
      <Show when={props.isMobileDrawer}>
        <div class="pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={props.onApplyMobile}
            class="w-full py-2.5 px-4 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-bold text-xs shadow-md transition-all active:scale-98"
          >
            Apply & Show Results ✨
          </button>
        </div>
      </Show>
    </aside>
  );
}
