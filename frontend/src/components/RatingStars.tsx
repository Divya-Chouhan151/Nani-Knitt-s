import { For, Show } from "solid-js";

export interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showNumeric?: boolean;
}

export function RatingStars(props: RatingStarsProps) {
  const roundedRating = () => Math.round(props.rating * 10) / 10;
  const fullStars = () => Math.floor(props.rating);
  const starsArray = () => [1, 2, 3, 4, 5];

  return (
    <div class="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      <div class="flex items-center text-amber-400" aria-label={`Rating: ${roundedRating()} out of 5 stars`}>
        <For each={starsArray()}>
          {(star) => (
            <span class={star <= fullStars() ? "text-amber-400" : "text-[var(--border)]"}>
              ★
            </span>
          )}
        </For>
      </div>
      <Show when={props.showNumeric ?? true}>
        <span class="font-semibold text-[var(--text-primary)]">{roundedRating().toFixed(1)}</span>
      </Show>
      <Show when={props.reviewCount !== undefined}>
        <span>({props.reviewCount})</span>
      </Show>
    </div>
  );
}
