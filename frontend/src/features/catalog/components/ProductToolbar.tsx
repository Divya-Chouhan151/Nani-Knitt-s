import { Show } from "solid-js";
import { localeStore } from "../../../stores/localeStore";

export interface ProductToolbarProps {
  totalElements?: number;
  activeFilterCount: number;
  onResetFilters: () => void;
  onOpenMobileFilters?: () => void;
  // Optional legacy props kept for backward compatibility if any test passes them
  sort?: string;
  onSortChange?: (sort: string) => void;
}

export function ProductToolbar(props: ProductToolbarProps) {
  return (
    <div class="flex items-center justify-between gap-4 py-3 mb-6 border-b border-[var(--border)]">
      {/* Mobile Filter & Sort trigger and Active Filters Clear */}
      <div class="flex items-center gap-3">
        <Show when={props.onOpenMobileFilters}>
          <button
            type="button"
            onClick={props.onOpenMobileFilters}
            class="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] shadow-xs hover:border-[var(--brand-500)] hover:bg-[var(--brand-50)]/40 dark:hover:bg-stone-800 transition-all active:scale-95"
            aria-label="Open filter and sort panel"
          >
            <span>⚙️</span>
            <span>Filter & Sort</span>
            <Show when={props.activeFilterCount > 0}>
              <span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {props.activeFilterCount}
              </span>
            </Show>
          </button>
        </Show>

        <Show when={props.activeFilterCount > 0}>
          <button
            type="button"
            onClick={props.onResetFilters}
            class="text-xs font-semibold text-[var(--brand-600)] hover:underline flex items-center gap-1.5 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 transition-all hover:bg-rose-500/15"
          >
            <span>{localeStore.t("catalog.clear_filters")} ({props.activeFilterCount})</span>
            <span class="text-xs font-bold">&times;</span>
          </button>
        </Show>
      </div>

      {/* Decorative artisan note */}
      <div class="text-xs text-[var(--text-secondary)] font-medium hidden sm:flex items-center gap-2 ml-auto">
        <span class="animate-yarn-bounce inline-block">🧶</span>
        <span>Every creation is crafted with patience & heart</span>
      </div>
    </div>
  );
}
