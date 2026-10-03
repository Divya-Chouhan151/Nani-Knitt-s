import { Show } from "solid-js";
import { localeStore } from "../stores/localeStore";

export interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PriceDisplay(props: PriceDisplayProps) {
  const formatAmount = (amount: number) => {
    return localeStore.formatPrice(amount);
  };

  const discountPercent = () => {
    if (props.compareAtPrice && props.compareAtPrice > props.price) {
      return Math.round(((props.compareAtPrice - props.price) / props.compareAtPrice) * 100);
    }
    return null;
  };

  const sizeClass = () => {
    switch (props.size || "md") {
      case "sm":
        return "text-sm font-semibold";
      case "xl":
        return "text-3xl font-extrabold";
      case "lg":
        return "text-2xl font-bold";
      case "md":
      default:
        return "text-lg font-bold";
    }
  };

  return (
    <div class="inline-flex items-baseline flex-wrap gap-2">
      <span class={`${sizeClass()} text-[var(--text-primary)] tracking-tight`}>
        {formatAmount(props.price)}
      </span>
      <Show when={props.compareAtPrice && props.compareAtPrice > props.price}>
        <span class="text-sm text-[var(--text-secondary)] line-through">
          {formatAmount(props.compareAtPrice!)}
        </span>
        <span class="text-xs font-bold text-[var(--success-text)] bg-[var(--success)] px-1.5 py-0.5 rounded-md">
          {discountPercent()}% OFF
        </span>
      </Show>
    </div>
  );
}
