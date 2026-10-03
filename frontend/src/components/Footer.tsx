import { createSignal, Show } from "solid-js";
import { localeStore } from "../stores/localeStore";
import { NaniKnittingLogo } from "./NaniKnittingLogo";

export function Footer() {
  const [emailInput, setEmailInput] = createSignal("");
  const [isSubscribed, setIsSubscribed] = createSignal(false);
  const [subscribeError, setSubscribeError] = createSignal("");

  const handleSubscribe = (e: Event) => {
    e.preventDefault();
    const email = emailInput().trim();
    if (!email || !email.includes("@")) {
      setSubscribeError("Please enter a valid email address");
      return;
    }
    setSubscribeError("");
    setIsSubscribed(true);
    setEmailInput("");
  };

  return (
    <footer class="bg-[var(--bg-surface)] border-t border-[var(--border)] pt-16 pb-12 mt-16 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border)]">
          {/* Brand & Mission (2 cols) */}
          <div class="lg:col-span-2 space-y-4">
            <a
              href="/"
              class="inline-block outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:opacity-85 [-webkit-tap-highlight-color:transparent]"
              aria-label="Nani's Knitts Home"
            >
              <NaniKnittingLogo />
            </a>
            <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
              Connecting thoughtful lovers of handmade with authentic cozy knits, ceramics, and heirloom treasures crafted with patient hands and warm hearts.
            </p>
            <div class="pt-2 flex items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
              <span>🧶 Hand-Knitted with Care</span>
              <span>•</span>
              <span>🌿 Natural Fibers</span>
              <span>•</span>
              <span>💖 Made with Love</span>
            </div>

            {/* Social Media Links */}
            <div class="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                class="w-8 h-8 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-xs hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] transition-all"
              >
                📸
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                class="w-8 h-8 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-xs hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] transition-all"
              >
                📌
              </a>
              <a
                href="https://etsy.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Etsy"
                class="w-8 h-8 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-xs hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] transition-all"
              >
                🧶
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                class="w-8 h-8 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-xs hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] transition-all"
              >
                𝕏
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {localeStore.t("footer.quick_links")}
            </h4>
            <ul class="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <a href="/profile/help" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("footer.faq")}
                </a>
              </li>
              <li>
                <a href="/shipping-returns" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("footer.shipping")}
                </a>
              </li>
              <li>
                <a href="/shipping-returns#return-window-conditions" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("footer.returns")}
                </a>
              </li>
              <li>
                <a href="/profile/settings" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("nav.settings")}
                </a>
              </li>
              <li>
                <a href="/profile/payment-methods" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("nav.payment_methods")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policy Column */}
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Studio &amp; Care
            </h4>
            <ul class="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <a href="/privacy" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="/terms" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("footer.terms")}
                </a>
              </li>
              <li>
                <a href="/profile/help" class="hover:text-[var(--brand-600)] transition-colors">
                  {localeStore.t("footer.about_us")}
                </a>
              </li>
              <li class="pt-2 text-[11px]">
                <span class="block font-bold text-[var(--text-secondary)]">Nani's Care Desk</span>
                <span class="text-[var(--text-primary)] font-medium">hello@nanisknitts.com</span>
              </li>
              <li class="text-[11px] text-[var(--text-secondary)]">
                <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {localeStore.t("footer.newsletter_title")}
            </h4>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
              {localeStore.t("footer.newsletter_desc")}
            </p>

            <Show
              when={!isSubscribed()}
              fallback={
                <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  ✨ Welcome to our artisan collector guild!
                </div>
              }
            >
              <form onSubmit={handleSubscribe} class="space-y-2">
                <div class="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    value={emailInput()}
                    onInput={(e) => setEmailInput(e.currentTarget.value)}
                    class="flex-1 bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                  />
                  <button
                    type="submit"
                    class="px-3.5 py-2 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                  >
                    {localeStore.t("footer.subscribe")}
                  </button>
                </div>
                <Show when={subscribeError()}>
                  <p class="text-[10px] text-rose-500 font-medium">{subscribeError()}</p>
                </Show>
              </form>
            </Show>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright with working legal routes */}
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <p>© 2026 <strong class="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 dark:from-rose-400 dark:via-pink-300 dark:to-amber-300 bg-clip-text text-transparent font-bold">Nani's Knitts</strong>. Handmade &amp; heartfelt. Every piece tells a story.</p>
          <div class="flex items-center gap-6">
            <a href="/privacy" class="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</a>
            <a href="/terms" class="hover:text-[var(--text-primary)] transition-colors">Terms of Service</a>
            <a href="/shipping-returns" class="hover:text-[var(--text-primary)] transition-colors">Shipping &amp; Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
