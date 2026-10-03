import { Show } from "solid-js";
import { ProductSummary } from "../../../types/product";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { PriceDisplay } from "../../../components/PriceDisplay";
import { RatingStars } from "../../../components/RatingStars";
import { authStore } from "../../auth/stores/authStore";
import { wishlistStore } from "../../profile/stores/wishlistStore";
import { localeStore } from "../../../stores/localeStore";
import { triggerCelebration } from "../../../components/CelebrationEffects";
import { WishlistHeartIcon } from "../../../components/WishlistHeartIcon";

export interface ProductCardProps {
  product: ProductSummary;
  onAddToCart?: (product: ProductSummary) => void;
  onQuickView?: (product: ProductSummary) => void;
}

export function ProductCard(props: ProductCardProps) {
  const stockVariant = () => {
    switch (props.product.stockStatus) {
      case "IN_STOCK":
        return "success";
      case "LOW_STOCK":
        return "warning";
      case "OUT_OF_STOCK":
      default:
        return "danger";
    }
  };

  const stockLabel = () => {
    switch (props.product.stockStatus) {
      case "IN_STOCK":
        return localeStore.t("product.in_stock");
      case "LOW_STOCK":
        return localeStore.t("product.low_stock");
      case "OUT_OF_STOCK":
      default:
        return localeStore.t("product.out_of_stock");
    }
  };

  const isOutOfStock = () => props.product.stockStatus === "OUT_OF_STOCK";

  return (
    <article
      data-testid="product-card"
      class="group relative flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-amber-500/30 will-change-transform shadow-xs"
    >
      {/* Thumbnail Container with Link & Quick View Trigger - clean image without overlay buttons */}
      <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-amber-50/20 dark:bg-stone-900/40 mb-3.5 shadow-inner">
        <a href={`/products/${props.product.slug}`} class="block w-full h-full">
          <img
            src={props.product.thumbnailUrl}
            alt={props.product.title}
            loading="lazy"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </a>

        {/* Quick View Button on Hover */}
        <Show when={props.onQuickView}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              props.onQuickView!(props.product);
            }}
            class="absolute inset-x-4 bottom-3 py-2 px-3 rounded-xl bg-[var(--bg-page)]/90 backdrop-blur-md text-xs font-bold text-[var(--text-primary)] border border-[var(--border)] shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--brand-600)] hover:text-white"
          >
            {localeStore.t("product.quick_view")} 👁️
          </button>
        </Show>

        {/* Merchandising Badge */}
        <Show when={props.product.badge}>
          <div class="absolute top-2.5 left-2.5 pointer-events-none">
            <Badge variant="brand">{props.product.badge!}</Badge>
          </div>
        </Show>
      </div>

      {/* Meta: Category & Title */}
      <div class="flex-1 flex flex-col">
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
            {props.product.category?.name || "Handcrafted"}
          </span>
          <Badge variant={stockVariant()}>{stockLabel()}</Badge>
        </div>

        <h3 class="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-600)] transition-colors line-clamp-2 mb-1.5 leading-snug">
          <a href={`/products/${props.product.slug}`} class="hover:underline">
            {props.product.title}
          </a>
        </h3>

        <Show when={props.product.shortDescription}>
          <p class="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
            {props.product.shortDescription}
          </p>
        </Show>

        {/* Rating and Reviews */}
        <div class="mb-3 mt-auto">
          <RatingStars
            rating={props.product.averageRating}
            reviewCount={props.product.reviewCount}
          />
        </div>

        {/* Price & Action Row (includes non-intrusive heart wishlist button) */}
        <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <PriceDisplay
            price={props.product.price}
            compareAtPrice={props.product.compareAtPrice}
            currency={props.product.currency}
          />

          <div class="flex items-center gap-1.5">
            {/* Wishlist Heart Action Button */}
            <button
              type="button"
              data-testid="wishlist-button"
              aria-label={
                wishlistStore.isWishlisted(props.product)
                  ? localeStore.t("product.in_wishlist")
                  : localeStore.t("product.save_wishlist")
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const wasWishlisted = wishlistStore.isWishlisted(props.product);
                wishlistStore.toggleWishlist(props.product);
                if (!wasWishlisted) {
                  triggerCelebration("wishlist");
                }
              }}
              class="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-page)]/70 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs text-sm"
              title={
                wishlistStore.isWishlisted(props.product)
                  ? localeStore.t("product.in_wishlist")
                  : localeStore.t("product.save_wishlist")
              }
            >
              <WishlistHeartIcon
                isWishlisted={wishlistStore.isWishlisted(props.product)}
                class="w-4 h-4"
              />
            </button>

            <Button
              size="sm"
              disabled={isOutOfStock()}
              onClick={() => {
                if (props.onAddToCart) {
                  authStore.requireAuth(
                    () => {
                      props.onAddToCart!(props.product);
                    },
                    `Sign in to add "${props.product.title}" to your cart`
                  );
                }
              }}
              class="whitespace-nowrap shadow-xs hover:shadow-md transition-shadow"
            >
              {isOutOfStock() ? localeStore.t("product.sold_out") : localeStore.t("product.add_to_cart")}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
