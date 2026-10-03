import { Router, Route } from "@solidjs/router";
import { Show } from "solid-js";
import { CatalogPage } from "./features/catalog/pages/CatalogPage";
import { ProductDetailPage } from "./features/catalog/pages/ProductDetailPage";
import { AuthModal } from "./features/auth/components/AuthModal";
import { authStore } from "./features/auth/stores/authStore";
import { CartDrawer } from "./features/cart/components/CartDrawer";
import { CelebrationEffects } from "./components/CelebrationEffects";

import { ProfileLayout } from "./features/profile/layouts/ProfileLayout";
import { PersonalDetailsTab } from "./features/profile/tabs/PersonalDetailsTab";
import { AddressesTab } from "./features/profile/tabs/AddressesTab";
import { OrdersTab } from "./features/profile/tabs/OrdersTab";
import { SecurityTab } from "./features/profile/tabs/SecurityTab";
import { WishlistTab } from "./features/profile/tabs/WishlistTab";
import { PaymentMethodsTab } from "./features/profile/tabs/PaymentMethodsTab";
import { SettingsTab } from "./features/profile/tabs/SettingsTab";
import { HelpCenterTab } from "./features/profile/tabs/HelpCenterTab";
import { LegalPage } from "./features/legal/LegalPage";

export function App() {
  return (
    <>
      <Router>
        <Route path="/" component={CatalogPage} />
        <Route path="/search" component={CatalogPage} />
        <Route path="/products/:slug" component={ProductDetailPage} />
        <Route path="/privacy" component={() => <LegalPage initialDocument="privacy" />} />
        <Route path="/terms" component={() => <LegalPage initialDocument="terms" />} />
        <Route path="/shipping-returns" component={() => <LegalPage initialDocument="shipping-returns" />} />
        <Route path="/legal/:slug" component={LegalPage} />
        <Route path="/profile" component={ProfileLayout}>
          <Route path="/" component={PersonalDetailsTab} />
          <Route path="/personal" component={PersonalDetailsTab} />
          <Route path="/addresses" component={AddressesTab} />
          <Route path="/orders" component={OrdersTab} />
          <Route path="/payment-methods" component={PaymentMethodsTab} />
          <Route path="/payments" component={PaymentMethodsTab} />
          <Route path="/security" component={SecurityTab} />
          <Route path="/wishlist" component={WishlistTab} />
          <Route path="/settings" component={SettingsTab} />
          <Route path="/help" component={HelpCenterTab} />
        </Route>
      </Router>

      {/* Global Slide-Out Cart Drawer */}
      <CartDrawer />

      {/* Celebratory Micro-Interaction Particle Shower */}
      <CelebrationEffects />

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Global Action Confirmation Toast */}
      <Show when={authStore.toastMessage()}>
        {(() => {
          const msg = authStore.toastMessage()!;
          const isWarning = msg.includes("⚠️") || msg.toLowerCase().includes("limit") || msg.toLowerCase().includes("maximum");
          return (
            <div role="status" aria-live="polite" class="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
              <div
                class={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold ${
                  isWarning
                    ? "bg-[var(--warning)] text-[var(--warning-text)] border-2 border-[var(--warning-text)]/40 shadow-lg"
                    : "bg-[var(--text-primary)] text-[var(--bg-page)] border border-[var(--border)]"
                }`}
              >
                <span class={isWarning ? "text-[var(--warning-text)] text-base" : "text-emerald-400 text-sm"} aria-hidden="true">
                  {isWarning ? "⚠️" : "✨"}
                </span>
                <span class="leading-snug">{msg}</span>
              </div>
            </div>
          );
        })()}
      </Show>
    </>
  );
}
