import { createSignal, createEffect, on, onCleanup, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authStore } from "../features/auth/stores/authStore";
import { cartStore } from "../features/cart/stores/cartStore";
import { wishlistStore } from "../features/profile/stores/wishlistStore";
import { localeStore } from "../stores/localeStore";
import { SearchAutocompleteDropdown } from "../features/search/components/SearchAutocompleteDropdown";
import { LanguageCurrencySwitcher } from "./LanguageCurrencySwitcher";

import { NaniKnittingLogo } from "./NaniKnittingLogo";

export interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
}

export function Header(props: HeaderProps) {
  let navigate: ReturnType<typeof useNavigate>;
  try {
    navigate = useNavigate();
  } catch {
    navigate = ((url: string) => {
      if (typeof window !== "undefined") {
        window.location.href = url;
      }
    }) as any;
  }
  const [isDark, setIsDark] = createSignal(false);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [internalQuery, setInternalQuery] = createSignal(props.searchQuery || "");
  let debounceTimer: any = null;
  let searchInputRef: HTMLInputElement | undefined;

  createEffect(
    on(
      () => props.searchQuery,
      (ext) => {
        if (ext === undefined) return;
        const isFocused = searchInputRef && document.activeElement === searchInputRef;
        if (!isFocused || ext === "") {
          setInternalQuery(ext);
        }
      }
    )
  );

  onCleanup(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  const handleInputChange = (value: string) => {
    setInternalQuery(value);
    setIsSearchOpen(true);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      props.onSearchChange?.(value);
    }, 250);
  };

  const handleSearchSubmit = (e: Event) => {
    e.preventDefault();
    if (debounceTimer) clearTimeout(debounceTimer);
    const q = internalQuery().trim();
    setIsSearchOpen(false);
    props.onSearchChange?.(q);
    if (props.onSearchSubmit) {
      props.onSearchSubmit(q);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleClear = () => {
    setInternalQuery("");
    if (debounceTimer) clearTimeout(debounceTimer);
    props.onSearchChange?.("");
    if (props.onSearchSubmit) {
      props.onSearchSubmit("");
    } else {
      navigate("/search");
    }
  };

  onMount(() => {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    setIsDark(isDarkMode);
  });

  const toggleTheme = () => {
    const next = !isDark();
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const roleBadgeColor = (role?: string) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "ROLE_MERCHANDISER":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "ROLE_SUPPORT":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  const roleDisplayName = (role?: string) => {
    if (!role) return "Customer";
    return role.replace("ROLE_", "");
  };

  return (
    <header class="sticky top-0 z-40 w-full bg-[var(--bg-page)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[5rem] sm:min-h-[5.5rem] py-2 flex items-center justify-between gap-4">
        {/* Brand Logo - Nani's Knitts */}
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="/"
            class="flex items-center group cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:opacity-85 [-webkit-tap-highlight-color:transparent]"
            aria-label="Nani's Knitts Home"
          >
            <NaniKnittingLogo size="lg" />
          </a>
        </div>

        {/* Search Bar */}
        <div class="flex-1 max-w-lg mx-4">
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            class="relative"
          >
            <input
              ref={searchInputRef}
              type="text"
              name="q"
              value={internalQuery()}
              onFocus={() => setIsSearchOpen(true)}
              onInput={(e) => handleInputChange(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
              placeholder={localeStore.t("nav.search_placeholder")}
              class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all"
            />
            {/* Search Submit Button (Magnifying Glass) */}
            <button
              type="submit"
              aria-label="Search"
              class="absolute left-3 top-2.5 text-[var(--text-secondary)] hover:text-[var(--brand-600)] transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Clear button if text is present */}
            <Show when={internalQuery().length > 0}>
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                class="absolute right-3 top-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0.5 rounded-full hover:bg-[var(--border)]/50 transition-colors"
              >
                ✕
              </button>
            </Show>

            {/* Auto-Complete Dropdown */}
            <SearchAutocompleteDropdown
              query={internalQuery()}
              isOpen={isSearchOpen()}
              onSelectProduct={(slug) => {
                setIsSearchOpen(false);
                navigate(`/products/${slug}`);
              }}
              onSelectCategory={(catName) => {
                setIsSearchOpen(false);
                setInternalQuery(catName);
                props.onSearchChange?.(catName);
                navigate(`/search?q=${encodeURIComponent(catName)}`);
              }}
              onSelectBrand={(brandName) => {
                setIsSearchOpen(false);
                setInternalQuery(brandName);
                props.onSearchChange?.(brandName);
                navigate(`/search?q=${encodeURIComponent(brandName)}`);
              }}
              onClose={() => setIsSearchOpen(false)}
            />
          </form>
        </div>

        {/* Actions: Currency/Lang Switcher, Theme Toggle, Wishlist, Cart & Sign In */}
        <div class="flex items-center gap-2">
          {/* Header Language & Currency Switcher */}
          <div class="hidden sm:block">
            <LanguageCurrencySwitcher variant="header" />
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            class="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-all"
          >
            {isDark() ? (
              <svg class="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
            ) : (
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Wishlist Link Button with Heart Icon */}
          <a
            href="/profile/wishlist"
            aria-label="Wishlist"
            class="relative flex items-center gap-1.5 p-2 rounded-xl text-[var(--text-secondary)] hover:text-rose-500 hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-all"
            title={localeStore.t("nav.wishlist")}
          >
            <span class="text-xl leading-none">❤️</span>
            <Show when={wishlistStore.totalCount() > 0}>
              <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-sm">
                {wishlistStore.totalCount()}
              </span>
            </Show>
          </a>

          {/* Shopping Cart Button */}
          <button
            type="button"
            aria-label="Shopping cart"
            onClick={() => cartStore.openCart()}
            class="relative flex items-center gap-2 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <Show when={cartStore.totalQuantity() > 0}>
              <span
                class={`absolute -top-1 -right-1 px-1 min-w-4 h-4 rounded-full text-white font-bold text-[9px] flex items-center justify-center shadow-sm transition-all ${
                  cartStore.isLimitReached()
                    ? "bg-rose-600 ring-2 ring-rose-400/50"
                    : "bg-[var(--brand-600)]"
                }`}
                title={cartStore.isLimitReached() ? "Cart is full (limit reached)" : "Cart items"}
              >
                {cartStore.totalQuantity()}
              </span>
            </Show>
          </button>

          {/* Authentication Section */}
          <Show
            when={authStore.isAuthenticated()}
            fallback={
              <button
                type="button"
                id="header-signin-btn"
                onClick={() => authStore.openAuthModal("login")}
                class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm hover:shadow transition-all ml-1"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{localeStore.t("nav.sign_in")}</span>
              </button>
            }
          >
            <div class="relative ml-1">
              <button
                type="button"
                id="header-user-menu-btn"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-all"
              >
                <div class="w-7 h-7 rounded-lg bg-[var(--brand-100)] dark:bg-[var(--brand-900)] text-[var(--brand-700)] dark:text-[var(--brand-300)] flex items-center justify-center font-bold text-xs overflow-hidden">
                  {authStore.user()?.avatarUrl ? (
                    <img src={authStore.user()!.avatarUrl} alt="" class="w-full h-full object-cover" />
                  ) : (
                    <span>{authStore.user()?.firstName?.[0] || "U"}</span>
                  )}
                </div>
                <div class="hidden sm:flex flex-col text-left leading-none">
                  <span class="text-xs font-semibold text-[var(--text-primary)]">
                    {authStore.user()?.firstName}
                  </span>
                  <span class={`text-[9px] font-bold uppercase tracking-wider mt-0.5 px-1 rounded border inline-block ${roleBadgeColor(authStore.user()?.roles?.[0])}`}>
                    {roleDisplayName(authStore.user()?.roles?.[0])}
                  </span>
                </div>
                <svg class="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              <Show when={isMenuOpen()}>
                <div
                  class="absolute right-0 mt-2 w-52 bg-[var(--bg-page)] border border-[var(--border)] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div class="px-3.5 py-2 border-b border-[var(--border)]">
                    <p class="text-xs font-bold text-[var(--text-primary)] truncate">
                      {authStore.user()?.firstName} {authStore.user()?.lastName}
                    </p>
                    <p class="text-[11px] text-[var(--text-secondary)] truncate">
                      {authStore.user()?.email}
                    </p>
                  </div>
                  <div class="py-1 border-b border-[var(--border)]">
                    <a
                      href="/profile/personal"
                      class="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/40 flex items-center gap-2 transition-colors"
                    >
                      <span>👤</span>
                      <span>{localeStore.t("nav.account")}</span>
                    </a>
                    <a
                      href="/profile/orders"
                      class="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/40 flex items-center gap-2 transition-colors"
                    >
                      <span>📦</span>
                      <span>{localeStore.t("nav.orders")}</span>
                    </a>
                    <a
                      href="/profile/wishlist"
                      class="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/40 flex items-center gap-2 transition-colors"
                    >
                      <span>🦋</span>
                      <span>{localeStore.t("nav.wishlist")}</span>
                    </a>
                    <a
                      href="/profile/payment-methods"
                      class="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/40 flex items-center gap-2 transition-colors"
                    >
                      <span>💳</span>
                      <span>{localeStore.t("nav.payment_methods")}</span>
                    </a>
                    <a
                      href="/profile/settings"
                      class="w-full text-left px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/40 flex items-center gap-2 transition-colors"
                    >
                      <span>⚙️</span>
                      <span>{localeStore.t("nav.settings")}</span>
                    </a>
                  </div>
                  <div class="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        authStore.logout();
                        setIsMenuOpen(false);
                      }}
                      class="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
