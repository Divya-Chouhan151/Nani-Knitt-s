import { For, Show } from "solid-js";

export interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination(props: PaginationProps) {
  const pages = () => {
    const total = props.totalPages;
    const current = props.pageNumber;
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <nav class="flex flex-wrap items-center justify-between gap-4 py-8 border-t border-[var(--border)] mt-8" aria-label="Pagination Navigation">
      <div class="flex items-center gap-2">
        <button
          onClick={() => props.onPageChange(props.pageNumber - 1)}
          disabled={props.pageNumber <= 0}
          class="px-3.5 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--brand-100)]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>

        <div class="flex items-center gap-1">
          <For each={pages()}>
            {(page) => (
              <button
                onClick={() => props.onPageChange(page)}
                class={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                  page === props.pageNumber
                    ? "bg-[var(--brand-600)] text-[var(--text-on-brand)] shadow-sm"
                    : "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--brand-100)]/40 border border-[var(--border)]"
                }`}
                aria-current={page === props.pageNumber ? "page" : undefined}
              >
                {page + 1}
              </button>
            )}
          </For>
        </div>

        <button
          onClick={() => props.onPageChange(props.pageNumber + 1)}
          disabled={props.pageNumber >= props.totalPages - 1 || props.totalPages === 0}
          class="px-3.5 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--brand-100)]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>

      <Show when={props.onPageSizeChange}>
        <div class="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span>Items per page:</span>
          <select
            value={props.pageSize}
            onChange={(e) => props.onPageSizeChange!(Number(e.currentTarget.value))}
            class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl py-1.5 px-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
          >
            <option value="12">12</option>
            <option value="20">20</option>
            <option value="40">40</option>
          </select>
        </div>
      </Show>
    </nav>
  );
}
