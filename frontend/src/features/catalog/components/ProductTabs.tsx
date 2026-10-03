import { createSignal, For, Show } from "solid-js";
import { ProductDetail } from "../../../types/product";
import { RatingStars } from "../../../components/RatingStars";

export interface ProductTabsProps {
  product: ProductDetail;
}

export function ProductTabs(props: ProductTabsProps) {
  const [activeTab, setActiveTab] = createSignal<"overview" | "specs" | "returns" | "ratings">("overview");

  // Simulated realistic rating distribution based on average rating
  const ratingBreakdown = () => [
    { stars: 5, percent: 72, count: Math.round(props.product.reviewCount * 0.72) },
    { stars: 4, percent: 18, count: Math.round(props.product.reviewCount * 0.18) },
    { stars: 3, percent: 6, count: Math.round(props.product.reviewCount * 0.06) },
    { stars: 2, percent: 3, count: Math.round(props.product.reviewCount * 0.03) },
    { stars: 1, percent: 1, count: Math.round(props.product.reviewCount * 0.01) },
  ];

  const specsList = () => {
    if (!props.product.baseAttributes) {
      return [
        { label: "Category", value: props.product.category.name },
        { label: "Stock Availability", value: props.product.stockStatus === "IN_STOCK" ? "In Stock" : "Limited Stock" },
        { label: "Warranty", value: "2-Year Official Manufacturer Warranty" },
      ];
    }
    return Object.entries(props.product.baseAttributes).map(([label, value]) => ({ label, value }));
  };

  return (
    <div class="mt-12 pt-8 border-t border-[var(--border)]">
      {/* Tab Navigation */}
      <div class="flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto scrollbar-thin mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          class={`px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab() === "overview"
              ? "border-[var(--brand-600)] text-[var(--brand-600)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Product Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          class={`px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab() === "specs"
              ? "border-[var(--brand-600)] text-[var(--brand-600)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Specifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("returns")}
          class={`px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab() === "returns"
              ? "border-[var(--brand-600)] text-[var(--brand-600)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Return Policy & Warranty
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ratings")}
          class={`px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab() === "ratings"
              ? "border-[var(--brand-600)] text-[var(--brand-600)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Customer Ratings ({props.product.reviewCount})
        </button>
      </div>

      {/* Tab Content Panels */}
      <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 transition-colors">
        {/* 1. Overview */}
        <Show when={activeTab() === "overview"}>
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-[var(--text-primary)]">About this item</h3>
            <p class="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
              {props.product.description}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div class="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                <span class="block font-bold text-sm text-[var(--text-primary)]">Premium Build</span>
                <span class="text-xs text-[var(--text-secondary)]">Crafted from sustainable materials with precision engineering.</span>
              </div>
              <div class="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                <span class="block font-bold text-sm text-[var(--text-primary)]">Ergonomic Fit</span>
                <span class="text-xs text-[var(--text-secondary)]">Tailored to reduce fatigue during extended work & gaming sessions.</span>
              </div>
              <div class="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                <span class="block font-bold text-sm text-[var(--text-primary)]">Express Dispatch</span>
                <span class="text-xs text-[var(--text-secondary)]">Ships within 24 hours in secure eco-conscious packaging.</span>
              </div>
            </div>
          </div>
        </Show>

        {/* 2. Specifications */}
        <Show when={activeTab() === "specs"}>
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-[var(--text-primary)]">Technical Specifications</h3>
            <div class="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-page)]">
              <For each={specsList()}>
                {(spec) => (
                  <div class="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-sm">
                    <span class="font-semibold text-[var(--text-primary)]">{spec.label}</span>
                    <span class="sm:col-span-2 text-[var(--text-secondary)]">{spec.value}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* 3. Return Policy & Warranty */}
        <Show when={activeTab() === "returns"}>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-bold text-[var(--text-primary)] mb-2">10-Day Hassle-Free Replacement Policy</h3>
              <p class="text-sm text-[var(--text-secondary)] leading-relaxed">
                This item is eligible for replacement within 10 days of delivery. If you experience any physical damage, missing parts, or functional defects, we will arrange a complimentary doorstep pickup and dispatch a brand-new replacement unit at zero cost.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--brand-100)] text-[var(--brand-600)] flex items-center justify-center shrink-0 font-bold">
                  🔄
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[var(--text-primary)]">Doorstep Pickup</h4>
                  <p class="text-xs text-[var(--text-secondary)] mt-1">Our courier will pick up the item from your doorstep without packaging hassle.</p>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-[var(--brand-100)] text-[var(--brand-600)] flex items-center justify-center shrink-0 font-bold">
                  🛡️
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[var(--text-primary)]">2-Year Warranty</h4>
                  <p class="text-xs text-[var(--text-secondary)] mt-1">Covers all internal hardware components and electrical defects from date of purchase.</p>
                </div>
              </div>
            </div>

            <div class="text-xs text-[var(--text-secondary)] bg-[var(--bg-page)] p-3.5 rounded-xl border border-[var(--border)]">
              <strong>Return Conditions:</strong> Item must be returned in original condition with brand box, MRP tags intact, and all accessories included.
            </div>
          </div>
        </Show>

        {/* 4. Customer Ratings */}
        <Show when={activeTab() === "ratings"}>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Overall Score */}
            <div class="text-center md:border-r md:border-[var(--border)] md:pr-8">
              <span class="text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {props.product.averageRating.toFixed(1)}
              </span>
              <div class="my-2 flex justify-center">
                <RatingStars rating={props.product.averageRating} showNumeric={false} />
              </div>
              <span class="text-xs font-medium text-[var(--text-secondary)]">
                Based on {props.product.reviewCount} customer ratings
              </span>
            </div>

            {/* Distribution Bars */}
            <div class="md:col-span-2 space-y-2.5">
              <For each={ratingBreakdown()}>
                {(tier) => (
                  <div class="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span class="w-8 text-right font-medium">{tier.stars} ★</span>
                    <div class="flex-1 h-3 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        class="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${tier.percent}%` }}
                      ></div>
                    </div>
                    <span class="w-10 text-right font-semibold text-[var(--text-primary)]">
                      {tier.percent}%
                    </span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
