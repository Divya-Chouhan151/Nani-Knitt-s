import { For } from "solid-js";

export interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton(props: ProductGridSkeletonProps) {
  const items = () => Array.from({ length: props.count || 8 }, (_, i) => i);

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      <For each={items()}>
        {() => (
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col">
            <div class="w-full aspect-square rounded-xl bg-[var(--border)]/60 mb-3.5"></div>
            <div class="h-3 w-1/3 bg-[var(--border)]/60 rounded mb-2"></div>
            <div class="h-5 w-3/4 bg-[var(--border)]/60 rounded mb-2"></div>
            <div class="h-3 w-full bg-[var(--border)]/40 rounded mb-3"></div>
            <div class="h-4 w-1/2 bg-[var(--border)]/50 rounded mb-4 mt-auto"></div>
            <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div class="h-6 w-1/3 bg-[var(--border)]/60 rounded"></div>
              <div class="h-8 w-24 bg-[var(--border)]/60 rounded-xl"></div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
