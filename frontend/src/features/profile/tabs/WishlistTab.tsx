import { createSignal, onMount, For, Show } from "solid-js";
import { WishlistItem } from "../../../types/profile";
import { wishlistStore } from "../stores/wishlistStore";
import { cartStore } from "../../cart/stores/cartStore";
import { authStore } from "../../auth/stores/authStore";
import { localeStore } from "../../../stores/localeStore";
import { WishlistHeartIcon } from "../../../components/WishlistHeartIcon";

export function WishlistTab() {
  const [movingId, setMovingId] = createSignal<string | null>(null);

  onMount(() => {
    wishlistStore.loadWishlist();
  });

  const handleRemove = async (itemOrId: string | WishlistItem) => {
    await wishlistStore.removeFromWishlist(itemOrId);
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    setMovingId(item.id);
    try {
      // Add to cart microservice
      const success = await cartStore.addItem({
        productId: item.productId,
        sku: item.sku,
        title: item.title,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      });

      // Remove from wishlist only if successfully added to cart
      if (success) {
        await wishlistStore.removeFromWishlist(item);
      }
    } catch (err: any) {
      authStore.showToast(`Failed to move to cart: ${err.message}`);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div class="space-y-6 animate-in fade-in duration-200">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">My Wishlist</h1>
          <p class="text-xs text-[var(--text-secondary)] mt-1">
            Products you have saved for later. Move them to your cart when you're ready to checkout.
          </p>
        </div>
        <span class="text-xs font-bold text-[var(--text-secondary)] px-3 py-1 bg-[var(--bg-page)] rounded-xl border border-[var(--border)]">
          {wishlistStore.items().length} Items Saved
        </span>
      </div>

      <Show
        when={!wishlistStore.isLoading()}
        fallback={
          <div class="py-12 text-center text-xs text-[var(--text-secondary)]">Loading wishlist...</div>
        }
      >
        <Show
          when={wishlistStore.items().length > 0}
          fallback={
            <div class="py-16 text-center border border-dashed border-[var(--border)] rounded-3xl p-8 space-y-3 bg-[var(--bg-surface)]/50">
              <span class="text-4xl block animate-bounce">💖</span>
              <h3 class="text-sm font-bold text-[var(--text-primary)]">{localeStore.t("wishlist.empty_title")}</h3>
              <p class="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {localeStore.t("wishlist.empty_sub")}
              </p>
              <a
                href="/"
                class="inline-block px-4 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold shadow-sm hover:shadow transition-all"
              >
                Explore Artisan Creations
              </a>
            </div>
          }
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <For each={wishlistStore.items()}>
              {(item) => (
                <div class="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col justify-between space-y-3 hover:border-[var(--brand-500)]/50 hover:shadow-lg transition-all group">
                  <div>
                    <div class="w-full aspect-square rounded-2xl bg-white/40 border border-[var(--border)] flex items-center justify-center overflow-hidden mb-3 relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span class="text-3xl">🏺</span>
                      )}
                      {/* Wishlist Heart Icon Button (Always Filled in Wishlist Tab) */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        class="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 transition-all group/btn"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        <WishlistHeartIcon isWishlisted={true} class="w-4 h-4" />
                      </button>
                    </div>

                    <div class="space-y-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          {item.sku}
                        </span>
                        <Show
                          when={item.inStock}
                          fallback={
                            <span class="text-[9px] font-bold text-rose-500">Made to Order</span>
                          }
                        >
                          <span class="text-[9px] font-bold text-emerald-500">In Stock</span>
                        </Show>
                      </div>

                      <h4 class="text-xs font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p class="text-sm font-bold text-[var(--text-primary)] pt-1">
                        {localeStore.formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  <div class="pt-2">
                    <button
                      type="button"
                      disabled={movingId() === item.id || !item.inStock}
                      onClick={() => handleMoveToCart(item)}
                      class="w-full py-2.5 px-3 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <span>🛒</span>
                      <span>{movingId() === item.id ? "Moving..." : "Move to Cart"}</span>
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
