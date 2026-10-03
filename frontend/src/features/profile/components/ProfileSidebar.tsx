import { A, useLocation } from "@solidjs/router";
import { authStore } from "../../auth/stores/authStore";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: "🏡", description: "Return to main storefront" },
  { path: "/profile/personal", label: "Personal Details", icon: "👤", description: "Name, email & phone verification" },
  { path: "/profile/addresses", label: "Addresses", icon: "📍", description: "Shipping & billing addresses" },
  { path: "/profile/orders", label: "Orders", icon: "📦", description: "History, tracking & returns" },
  { path: "/profile/payment-methods", label: "Payment Methods", icon: "💳", description: "Saved UPI IDs & default checkout" },
  { path: "/profile/security", label: "Login & Security", icon: "🔒", description: "Password, 2FA & active sessions" },
  { path: "/profile/wishlist", label: "Wishlist", icon: "💖", description: "Saved favorite items" },
  { path: "/profile/settings", label: "Settings", icon: "⚙️", description: "Preferences & account deactivation" },
  { path: "/profile/help", label: "Help Center", icon: "💬", description: "FAQs & customer support tickets" },
];

export function ProfileSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return false;
    return (
      location.pathname === path ||
      (path === "/profile/personal" && (location.pathname === "/profile" || location.pathname === "/profile/"))
    );
  };

  return (
    <aside class="w-full lg:w-72 flex-shrink-0">
      {/* User Quick Info Card */}
      <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 mb-4 shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--brand-600)] to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden flex-shrink-0">
            {authStore.user()?.avatarUrl ? (
              <img src={authStore.user()!.avatarUrl} alt="Avatar" class="w-full h-full object-cover" />
            ) : (
              <span>{authStore.user()?.firstName?.[0] || "U"}</span>
            )}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-sm text-[var(--text-primary)] truncate">
              {authStore.user()?.firstName || "Guest"} {authStore.user()?.lastName || "User"}
            </h3>
            <p class="text-xs text-[var(--text-secondary)] truncate">
              {authStore.user()?.email || "Sign in to manage profile"}
            </p>
            <div class="mt-1 flex items-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="text-[10px] font-semibold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
                {authStore.user()?.status || "Guest"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop & Mobile Navigation Links */}
      <nav class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-2 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const active = () => isActive(item.path);
          return (
            <A
              href={item.path}
              class={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink ${
                active()
                  ? "bg-[var(--brand-600)] text-white shadow-sm font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/30"
              }`}
            >
              <span class="text-base">{item.icon}</span>
              <div class="flex flex-col text-left">
                <span>{item.label}</span>
                <span class={`text-[10px] hidden lg:block ${active() ? "text-white/80" : "text-[var(--text-secondary)] font-normal"}`}>
                  {item.description}
                </span>
              </div>
            </A>
          );
        })}
      </nav>
    </aside>
  );
}
