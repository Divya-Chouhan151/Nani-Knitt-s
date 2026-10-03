import { createSignal, For, Show } from "solid-js";
import { cartStore, MAX_CART_ITEMS } from "../stores/cartStore";
import { localeStore } from "../../../stores/localeStore";
import { authStore } from "../../auth/stores/authStore";
import { CheckoutAddressConfirmModal } from "../../checkout/components/CheckoutAddressConfirmModal";

export function CartDrawer() {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = createSignal(false);

  return (
    <>
      <Show when={cartStore.isCartOpen()}>
      <div class="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => cartStore.closeCart()}
          aria-hidden="true"
        />

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-md bg-[var(--bg-page)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div class="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
              <div class="flex items-center gap-2">
                <span class="text-xl">🛍️</span>
                <h2 class="text-lg font-bold text-[var(--text-primary)]">
                  My Cart
                </h2>
                <span
                  class={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                    cartStore.totalQuantity() >= MAX_CART_ITEMS
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {cartStore.totalQuantity()} / {MAX_CART_ITEMS}
                  {cartStore.totalQuantity() >= MAX_CART_ITEMS ? " (MAX)" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => cartStore.closeCart()}
                class="w-8 h-8 rounded-full bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Cart Limit Notification Alert Banner */}
            <Show when={cartStore.totalQuantity() >= MAX_CART_ITEMS}>
              <div
                role="alert"
                class="mx-6 mt-4 p-3.5 rounded-2xl bg-[var(--warning)] border-2 border-[var(--warning-text)]/40 text-xs text-[var(--warning-text)] flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2"
              >
                <span class="text-xl leading-none shrink-0" aria-hidden="true">⚠️</span>
                <div class="flex-1">
                  <div class="flex items-center justify-between font-bold">
                    <span class="text-[var(--warning-text)] font-extrabold text-xs">Cart Limit Reached</span>
                    <span class="px-2 py-0.5 rounded-md bg-[var(--warning-text)] text-[var(--warning)] text-[10px] font-black tracking-wide uppercase">
                      Maximum Capacity
                    </span>
                  </div>
                  <p class="text-[11px] text-[var(--warning-text)] mt-1 leading-relaxed font-medium">
                    You've reached the maximum limit of <strong class="font-bold underline decoration-[var(--warning-text)]/60">{MAX_CART_ITEMS} items</strong>. Please proceed to checkout or remove items to add other creations.
                  </p>
                </div>
              </div>
            </Show>

            {/* Cart Items List or Empty State */}
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <Show
                when={cartStore.items().length > 0}
                fallback={
                  <div class="py-16 text-center space-y-4">
                    <div class="w-20 h-20 mx-auto rounded-3xl bg-amber-100/40 dark:bg-stone-800 flex items-center justify-center text-4xl shadow-inner animate-yarn-bounce">
                      🧶
                    </div>
                    <div class="space-y-1">
                      <h3 class="text-base font-bold text-[var(--text-primary)]">
                        Your cart is empty
                      </h3>
                      <p class="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                        Cozy handcrafted treasures and unique artisan pieces are waiting for you.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cartStore.closeCart()}
                      class="inline-block px-5 py-2.5 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold shadow-sm hover:shadow transition-all"
                    >
                      Explore Creations 🌸
                    </button>
                  </div>
                }
              >
                <For each={cartStore.items()}>
                  {(item) => (
                    <div class="flex gap-4 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xs transition-all hover:border-amber-400/40">
                      {/* Thumbnail */}
                      <div class="w-16 h-16 rounded-xl overflow-hidden bg-amber-50/30 shrink-0 border border-[var(--border)]">
                        <Show
                          when={item.imageUrl}
                          fallback={
                            <div class="w-full h-full flex items-center justify-center text-2xl">
                              🏺
                            </div>
                          }
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            class="w-full h-full object-cover object-center"
                          />
                        </Show>
                      </div>

                      {/* Details */}
                      <div class="flex-1 min-w-0 flex flex-col justify-between">
                        <div class="flex items-start justify-between gap-2">
                          <h4 class="text-xs font-bold text-[var(--text-primary)] truncate">
                            {item.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => cartStore.removeItem(item.id)}
                            class="text-xs text-rose-500 hover:text-rose-700 p-1"
                            title="Remove"
                          >
                            🗑️
                          </button>
                        </div>

                        <div class="flex items-center justify-between pt-2">
                          <span class="text-xs font-extrabold text-[var(--text-primary)]">
                            {localeStore.formatPrice(item.price)}
                          </span>

                          {/* Quantity selector */}
                          <div class="flex items-center border border-[var(--border)] rounded-lg bg-[var(--bg-page)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                cartStore.updateQuantity(item.id, item.quantity - 1)
                              }
                              class="px-2 py-0.5 text-xs hover:bg-[var(--brand-100)]/40 text-[var(--text-primary)] font-bold transition-colors"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span class="px-2 py-0.5 text-xs font-bold text-[var(--text-primary)]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (cartStore.totalQuantity() >= MAX_CART_ITEMS) {
                                  cartStore.notifyCartLimit();
                                } else {
                                  cartStore.updateQuantity(item.id, item.quantity + 1);
                                }
                              }}
                              class={`px-2 py-0.5 text-xs font-bold transition-colors ${
                                cartStore.totalQuantity() >= MAX_CART_ITEMS
                                  ? "text-[var(--text-secondary)] opacity-40 cursor-not-allowed hover:bg-rose-500/10"
                                  : "hover:bg-[var(--brand-100)]/40 text-[var(--text-primary)]"
                              }`}
                              title={
                                cartStore.totalQuantity() >= MAX_CART_ITEMS
                                  ? `Cart limit reached (${MAX_CART_ITEMS} max)`
                                  : "Increase quantity"
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>

            {/* Footer Checkout Summary */}
            <Show when={cartStore.items().length > 0}>
              <div class="p-6 border-t border-[var(--border)] bg-[var(--bg-surface)] space-y-4">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span class="font-semibold text-[var(--text-primary)]">
                      {localeStore.formatPrice(cartStore.subtotal())}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-[var(--text-secondary)]">
                    <span>Artisan Shipping</span>
                    <span class="text-emerald-600 font-bold">FREE ✨</span>
                  </div>
                  <div class="pt-2 border-t border-[var(--border)] flex items-center justify-between text-sm font-extrabold text-[var(--text-primary)]">
                    <span>Total</span>
                    <span>{localeStore.formatPrice(cartStore.subtotal())}</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="cart-checkout-btn"
                  onClick={() => {
                    if (!authStore.isAuthenticated()) {
                      authStore.openAuthModal("login", "Please sign in to confirm your delivery address and checkout.");
                      return;
                    }
                    cartStore.closeCart();
                    setIsCheckoutModalOpen(true);
                  }}
                  class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-[var(--brand-600)] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Checkout ({localeStore.formatPrice(cartStore.subtotal())}) 💖
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>

    {/* Mandatory Address Confirmation Step Before Payment Modal */}
    <CheckoutAddressConfirmModal
      isOpen={isCheckoutModalOpen()}
      onClose={() => setIsCheckoutModalOpen(false)}
    />
  </>
  );
}
