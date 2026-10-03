import { createResource, createSignal, Show, Suspense } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { fetchProductByIdOrSlug } from "../../../api/products";
import { Header } from "../../../components/Header";
import { ProductGallery } from "../components/ProductGallery";
import { ProductTabs } from "../components/ProductTabs";
import { PriceDisplay } from "../../../components/PriceDisplay";
import { RatingStars } from "../../../components/RatingStars";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { ProductDetail } from "../../../types/product";
import { authStore } from "../../auth/stores/authStore";
import { wishlistStore } from "../../profile/stores/wishlistStore";
import { cartStore, MAX_CART_ITEMS } from "../../cart/stores/cartStore";
import { Footer } from "../../../components/Footer";
import { triggerCelebration } from "../../../components/CelebrationEffects";
import { WishlistHeartIcon } from "../../../components/WishlistHeartIcon";

export function ProductDetailPage() {
  const params = useParams();
  const [quantity, setQuantity] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");

  // Resource fetching product by slug from URL parameter
  const [product] = createResource(() => params.slug, fetchProductByIdOrSlug);

  const handleAddToCart = async (prod: ProductDetail) => {
    const success = await cartStore.addItem({
      productId: prod.id,
      sku: prod.slug,
      title: prod.title,
      price: prod.price,
      quantity: quantity(),
      imageUrl: prod.thumbnailUrl || prod.images?.[0]?.url,
    });
    if (success) {
      triggerCelebration("cart");
    }
  };

  const handleBuyNow = async (prod: ProductDetail) => {
    const success = await cartStore.addItem({
      productId: prod.id,
      sku: prod.slug,
      title: prod.title,
      price: prod.price,
      quantity: quantity(),
      imageUrl: prod.thumbnailUrl || prod.images?.[0]?.url,
    });
    cartStore.openCart();
    if (success) {
      triggerCelebration("cart");
    }
  };

  const toggleWishlist = () => {
    const prod = product();
    if (!prod) return;
    const wasWishlisted = wishlistStore.isWishlisted(prod);
    wishlistStore.toggleWishlist(prod);
    if (!wasWishlisted) {
      triggerCelebration("wishlist");
    }
  };

  return (
    <div class="min-h-screen bg-[var(--bg-page)] flex flex-col transition-colors">
      <Header
        searchQuery={searchQuery()}
        onSearchChange={setSearchQuery}
      />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense
          fallback={
            <div class="py-16 text-center text-sm font-semibold text-[var(--text-secondary)] animate-pulse">
              Loading product details...
            </div>
          }
        >
          <Show
            when={product()}
            fallback={
              <div class="text-center py-20 bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8">
                <h2 class="text-2xl font-bold text-[var(--text-primary)] mb-2">Product Not Found</h2>
                <p class="text-sm text-[var(--text-secondary)] mb-6">
                  The product you are looking for does not exist or may have been removed.
                </p>
                <A
                  href="/"
                  class="inline-block px-6 py-2.5 rounded-xl bg-[var(--brand-600)] text-[var(--text-on-brand)] font-semibold hover:bg-[var(--brand-700)] transition-colors"
                >
                  Return to Storefront
                </A>
              </div>
            }
          >
            {(prod) => (
              <div>
                {/* Back Arrow & Breadcrumbs */}
                <div class="flex items-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.history.length > 1) {
                        window.history.back();
                      } else {
                        navigate("/");
                      }
                    }}
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-500)]/50 transition-all cursor-pointer group shadow-2xs"
                    aria-label="Go back to previous page"
                  >
                    <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back</span>
                  </button>

                  <nav class="flex items-center gap-2 text-xs text-[var(--text-secondary)]" aria-label="Breadcrumb">
                    <A href="/" class="hover:text-[var(--brand-600)] transition-colors">Home</A>
                    <span>/</span>
                    <A href="/" class="hover:text-[var(--brand-600)] transition-colors">{prod().category.name}</A>
                    <span>/</span>
                    <span class="text-[var(--text-primary)] font-medium truncate max-w-xs">{prod().title}</span>
                  </nav>
                </div>

                {/* Main Hero Product Display (2 Columns) */}
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                  {/* Left Column: Multi-Angle Image Gallery (5 cols) */}
                  <div class="lg:col-span-6">
                    <ProductGallery images={prod().images} title={prod().title} />
                  </div>

                  {/* Right Column: Title, Rating, Price, Purchase Actions (6 cols) */}
                  <div class="lg:col-span-6 flex flex-col">
                    <div class="flex items-center gap-2.5 mb-2">
                      <span class="text-xs font-bold tracking-wider text-[var(--brand-600)] uppercase">
                        {prod().category.name}
                      </span>
                      <Show when={prod().badge}>
                        <Badge variant="brand">{prod().badge!}</Badge>
                      </Show>
                      <Badge variant={prod().stockStatus === "IN_STOCK" ? "success" : "danger"}>
                        {prod().stockStatus === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight mb-3">
                      {prod().title}
                    </h1>

                    <div class="flex items-center gap-4 mb-5">
                      <RatingStars rating={prod().averageRating} reviewCount={prod().reviewCount} />
                      <span class="text-xs text-[var(--text-secondary)]">|</span>
                      <span class="text-xs text-[var(--brand-600)] font-semibold cursor-pointer hover:underline">
                        Read verified reviews
                      </span>
                    </div>

                    {/* Price Block */}
                    <div class="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] mb-6">
                      <PriceDisplay
                        price={prod().price}
                        compareAtPrice={prod().compareAtPrice}
                        currency={prod().currency}
                        size="xl"
                      />
                      <span class="block text-xs text-[var(--text-secondary)] mt-1">
                        Inclusive of all applicable taxes. Free delivery on orders.
                      </span>
                    </div>

                    <p class="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                      {prod().shortDescription}
                    </p>

                    {/* Purchase Box */}
                    <div class="space-y-4 pt-2 border-t border-[var(--border)]">
                      {/* Quantity & Stock Status */}
                      <div class="flex items-center gap-4">
                        <span class="text-sm font-semibold text-[var(--text-primary)]">Quantity:</span>
                        <div class="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] overflow-hidden">
                          <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity() <= 1 || prod().stockStatus === "OUT_OF_STOCK"}
                            class="px-3.5 py-2 text-base hover:bg-[var(--brand-100)]/40 disabled:opacity-40"
                          >
                            -
                          </button>
                          <span class="px-5 py-2 text-sm font-bold text-[var(--text-primary)]">{quantity()}</span>
                          <button
                            onClick={() => setQuantity((q) => q + 1)}
                            disabled={prod().stockStatus === "OUT_OF_STOCK"}
                            class="px-3.5 py-2 text-base hover:bg-[var(--brand-100)]/40 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Cart limit reached notification banner */}
                      <Show when={cartStore.isLimitReached()}>
                        <div role="alert" class="p-3.5 rounded-xl bg-[var(--warning)] border-2 border-[var(--warning-text)]/40 text-xs text-[var(--warning-text)] flex items-center gap-2.5 shadow-sm">
                          <span class="text-base shrink-0" aria-hidden="true">⚠️</span>
                          <span class="leading-tight font-medium">
                            <strong class="font-extrabold underline decoration-[var(--warning-text)]/60">Cart limit reached:</strong> Your cart currently has {cartStore.totalQuantity()} items (maximum {MAX_CART_ITEMS}).
                          </span>
                        </div>
                      </Show>

                      {/* Action CTA Buttons */}
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Button
                          variant="secondary"
                          size="lg"
                          disabled={prod().stockStatus === "OUT_OF_STOCK"}
                          onClick={() => handleAddToCart(prod())}
                          class="w-full"
                        >
                          Add to Cart
                        </Button>

                        <Button
                          variant="primary"
                          size="lg"
                          disabled={prod().stockStatus === "OUT_OF_STOCK"}
                          onClick={() => handleBuyNow(prod())}
                          class="w-full"
                        >
                          Buy Now
                        </Button>
                      </div>

                      {/* Wishlist Button with SVG Heart */}
                      <button
                        type="button"
                        onClick={toggleWishlist}
                        class="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:border-rose-400/50 transition-all duration-200 active:scale-98 shadow-xs"
                      >
                        <WishlistHeartIcon
                          isWishlisted={wishlistStore.isWishlisted(prod())}
                          class="w-5 h-5"
                        />
                        <span class={wishlistStore.isWishlisted(prod()) ? "text-rose-600 dark:text-rose-400 font-bold" : ""}>
                          {wishlistStore.isWishlisted(prod()) ? "Saved in Wishlist (Click to remove)" : "Save to Wishlist"}
                        </span>
                      </button>
                    </div>

                    {/* Artisan Trust Highlights Strip */}
                    <div class="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
                      <div class="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                        <span class="block text-base mb-1">✨</span>
                        <span class="font-bold text-[var(--text-primary)] block">100% Handcrafted</span>
                        <span>Made by Master Artisans</span>
                      </div>
                      <div class="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                        <span class="block text-base mb-1">🌿</span>
                        <span class="font-bold text-[var(--text-primary)] block">Pure Materials</span>
                        <span>Natural Woods & Clays</span>
                      </div>
                      <div class="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                        <span class="block text-base mb-1">🤝</span>
                        <span class="font-bold text-[var(--text-primary)] block">Fair Trade</span>
                        <span>Direct Maker Provenance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabbed Info Section (Overview, Specs, Return Policy, Customer Ratings) */}
                <ProductTabs product={prod()} />
              </div>
            )}
          </Show>
        </Suspense>
      </main>

      {/* Reusable Rich Footer */}
      <Footer />
    </div>
  );
}
