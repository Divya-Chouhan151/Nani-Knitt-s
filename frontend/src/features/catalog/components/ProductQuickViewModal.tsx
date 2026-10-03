import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { ProductDetail } from "../../../types/product";
import { ProductGallery } from "./ProductGallery";
import { PriceDisplay } from "../../../components/PriceDisplay";
import { RatingStars } from "../../../components/RatingStars";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { authStore } from "../../auth/stores/authStore";
import { wishlistStore } from "../../profile/stores/wishlistStore";
import { triggerCelebration } from "../../../components/CelebrationEffects";
import { WishlistHeartIcon } from "../../../components/WishlistHeartIcon";

export interface ProductQuickViewModalProps {
  product: ProductDetail | null;
  onClose: () => void;
  onAddToCart?: (product: ProductDetail, quantity: number) => void;
  onBuyNow?: (product: ProductDetail, quantity: number) => void;
  onToggleWishlist?: (product: ProductDetail) => void;
  isWishlisted?: boolean;
}

export function ProductQuickViewModal(props: ProductQuickViewModalProps) {
  const [quantity, setQuantity] = createSignal(1);

  createEffect(() => {
    if (props.product) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          props.onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      onCleanup(() => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      });
    } else {
      document.body.style.overflow = "";
    }
  });

  onCleanup(() => {
    document.body.style.overflow = "";
  });

  const isOutOfStock = () => props.product?.stockStatus === "OUT_OF_STOCK";

  return (
    <Show when={props.product}>
      {(prod) => (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={props.onClose}
            aria-hidden="true"
          ></div>

          {/* Modal Card */}
          <div class="relative w-full max-w-4xl bg-[var(--bg-page)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
            {/* Close Button */}
            <button
              onClick={props.onClose}
              class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
              {/* Left Column: Multi-Angle Photo Gallery */}
              <div>
                <ProductGallery images={prod().images} title={prod().title} />
              </div>

              {/* Right Column: Details & Actions */}
              <div class="flex flex-col">
                <span class="text-xs font-bold tracking-wider text-[var(--brand-600)] uppercase mb-1">
                  {prod().category.name}
                </span>

                <h2 class="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug mb-2">
                  {prod().title}
                </h2>

                <div class="flex items-center gap-3 mb-4">
                  <RatingStars rating={prod().averageRating} reviewCount={prod().reviewCount} />
                  <Show when={prod().badge}>
                    <Badge variant="brand">{prod().badge!}</Badge>
                  </Show>
                  <Badge variant={prod().stockStatus === "IN_STOCK" ? "success" : "danger"}>
                    {prod().stockStatus === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <div class="mb-5 pb-4 border-b border-[var(--border)]">
                  <PriceDisplay
                    price={prod().price}
                    compareAtPrice={prod().compareAtPrice}
                    currency={prod().currency}
                    size="xl"
                  />
                </div>

                <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {prod().shortDescription || prod().description}
                </p>

                {/* Quantity Selector & CTAs */}
                <div class="mt-auto space-y-3.5">
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-semibold text-[var(--text-secondary)]">Quantity:</span>
                    <div class="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity() <= 1 || isOutOfStock()}
                        class="px-3 py-1.5 text-sm hover:bg-[var(--brand-100)]/40 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span class="px-4 py-1.5 text-sm font-bold text-[var(--text-primary)]">{quantity()}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        disabled={isOutOfStock()}
                        class="px-3 py-1.5 text-sm hover:bg-[var(--brand-100)]/40 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      disabled={isOutOfStock()}
                      onClick={() => {
                        authStore.requireAuth(
                          () => props.onAddToCart?.(prod(), quantity()),
                          `Sign in to add ${quantity()} × "${prod().title}" to your cart`
                        );
                      }}
                    >
                      Add to Cart
                    </Button>

                    <Button
                      variant="primary"
                      disabled={isOutOfStock()}
                      onClick={() => {
                        authStore.requireAuth(
                          () => props.onBuyNow?.(prod(), quantity()),
                          `Sign in to buy ${quantity()} × "${prod().title}"`
                        );
                      }}
                    >
                      Buy Now
                    </Button>
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const wasWishlisted = wishlistStore.isWishlisted(prod());
                        wishlistStore.toggleWishlist(prod());
                        props.onToggleWishlist?.(prod());
                        if (!wasWishlisted) {
                          triggerCelebration("wishlist");
                        }
                      }}
                      class="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-rose-500 transition-colors group"
                    >
                      <WishlistHeartIcon
                        isWishlisted={wishlistStore.isWishlisted(prod())}
                        class="w-4 h-4"
                      />
                      <span class={wishlistStore.isWishlisted(prod()) ? "text-rose-600 dark:text-rose-400 font-bold" : ""}>
                        {wishlistStore.isWishlisted(prod()) ? "In Wishlist" : "Save to Wishlist"}
                      </span>
                    </button>

                    <a
                      href={`/products/${prod().slug}`}
                      class="text-xs font-bold text-[var(--brand-600)] hover:underline"
                    >
                      View full details &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}
