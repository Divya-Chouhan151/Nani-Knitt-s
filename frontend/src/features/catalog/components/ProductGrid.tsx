import { For, Show } from "solid-js";
import { ProductSummary } from "../../../types/product";
import { ProductCard } from "./ProductCard";

export interface ProductGridProps {
  products: ProductSummary[];
  onAddToCart?: (product: ProductSummary) => void;
  onQuickView?: (product: ProductSummary) => void;
  onResetFilters?: () => void;
}

export function ProductGrid(props: ProductGridProps) {
  return (
    <div>
      <Show
        when={props.products.length > 0}
        fallback={
          <div class="text-center py-16 px-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--brand-100)] flex items-center justify-center text-[var(--brand-600)]">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-2">No matching products found</h3>
            <p class="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              We couldn't find anything matching your current filters. Try changing keywords or resetting filters.
            </p>
            <Show when={props.onResetFilters}>
              <button
                onClick={props.onResetFilters}
                class="px-5 py-2.5 rounded-xl bg-[var(--brand-600)] text-[var(--text-on-brand)] font-medium hover:bg-[var(--brand-700)] transition-all shadow-sm"
              >
                Clear all filters
              </button>
            </Show>
          </div>
        }
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
          <For each={props.products}>
            {(product) => (
              <ProductCard
                product={product}
                onAddToCart={props.onAddToCart}
                onQuickView={props.onQuickView}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
