import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import { fetchSuggestions, SuggestionResponse } from "../../../api/search";
import { PRODUCT_METADATA_MAP } from "../../../api/products";

export interface SearchAutocompleteDropdownProps {
  query: string;
  isOpen: boolean;
  onSelectProduct: (slug: string) => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectBrand: (brand: string) => void;
  onClose: () => void;
}

export function SearchAutocompleteDropdown(props: SearchAutocompleteDropdownProps) {
  const [suggestions, setSuggestions] = createSignal<SuggestionResponse | null>(null);
  const [loading, setLoading] = createSignal(false);
  let debounceTimer: any = null;

  createEffect(() => {
    const q = props.query;
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!q || q.trim().length < 2 || !props.isOpen) {
      setSuggestions(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer = setTimeout(async () => {
      try {
        const result = await fetchSuggestions(q);
        setSuggestions(result);
      } finally {
        setLoading(false);
      }
    }, 200);
  });

  onCleanup(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  const ALLOWED_CATEGORIES = ["men", "women", "kids"];

  const hasContent = () => {
    const s = suggestions();
    if (!s) return false;
    const catCount = s.categories.filter((c) => ALLOWED_CATEGORIES.includes(c.name.toLowerCase())).length;
    return s.products.length > 0 || catCount > 0 || s.brands.length > 0;
  };

  return (
    <Show when={props.isOpen && (loading() || hasContent())}>
      <div class="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[480px] overflow-y-auto">
        <Show when={loading()}>
          <div class="p-4 text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <span class="inline-block w-4 h-4 border-2 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"></span>
            Searching suggestions...
          </div>
        </Show>

        <Show when={!loading() && suggestions()}>
          {(data) => {
            const filteredCategories = () =>
              data().categories.filter((cat) => ALLOWED_CATEGORIES.includes(cat.name.toLowerCase()));

            return (
              <div class="p-3 space-y-4">
                {/* Matched Categories (strictly Men, Women, Kids) */}
                <Show when={filteredCategories().length > 0}>
                  <div>
                    <span class="block px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Categories
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      <For each={filteredCategories()}>
                        {(cat) => (
                          <button
                            type="button"
                            onClick={() => {
                              props.onSelectCategory(cat.name);
                              props.onClose();
                            }}
                            class="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-page)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)] text-[var(--text-primary)] hover:text-[var(--brand-600)] border border-[var(--border)] transition-colors"
                          >
                            {cat.name}
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>

                {/* Matched Brands */}
                <Show when={data().brands.length > 0}>
                  <div>
                    <span class="block px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Brands
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      <For each={data().brands}>
                        {(brand) => (
                          <button
                            type="button"
                            onClick={() => {
                              props.onSelectBrand(brand);
                              props.onClose();
                            }}
                            class="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-page)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)] text-[var(--text-primary)] hover:text-[var(--brand-600)] border border-[var(--border)] transition-colors"
                          >
                            {brand}
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>

                {/* Matched Products */}
                <Show when={data().products.length > 0}>
                  <div>
                    <span class="block px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Products
                    </span>
                    <div class="space-y-1">
                      <For each={data().products}>
                        {(prod) => {
                          const meta = PRODUCT_METADATA_MAP[prod.id] || PRODUCT_METADATA_MAP[prod.slug];
                          const displayTitle = meta?.title || prod.title;
                          const displayThumb = meta?.thumbnailUrl || prod.thumbnailUrl;

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                props.onSelectProduct(meta?.slug || prod.slug);
                                props.onClose();
                              }}
                              class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-page)] text-left transition-colors group"
                            >
                              <Show
                                when={displayThumb}
                                fallback={
                                  <div class="w-10 h-10 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-secondary)]">
                                    🧶
                                  </div>
                                }
                              >
                                <img
                                  src={displayThumb}
                                  alt={displayTitle}
                                  class="w-10 h-10 rounded-lg object-cover border border-[var(--border)] flex-shrink-0"
                                />
                              </Show>
                              <div class="flex-1 min-w-0">
                                <p class="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-600)] transition-colors">
                                  {displayTitle}
                                </p>
                                <Show when={meta?.audience || prod.categoryName}>
                                  <span class="text-[10px] text-[var(--text-secondary)]">
                                    in {meta?.audience || prod.categoryName}
                                  </span>
                                </Show>
                              </div>
                              <Show when={prod.price !== undefined}>
                                <span class="text-xs font-bold text-[var(--text-primary)] flex-shrink-0">
                                  ₹{prod.price?.toLocaleString()}
                                </span>
                              </Show>
                            </button>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </Show>
      </div>
    </Show>
  );
}
