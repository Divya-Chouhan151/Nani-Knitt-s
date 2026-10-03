import { PaymentMethodsSettings } from "../components/PaymentMethodsSettings";

export function PaymentMethodsTab() {
  return (
    <div class="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">Payment Methods</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          Manage your saved UPI VPAs and payment instruments for faster 1-click checkout.
        </p>
      </div>

      <PaymentMethodsSettings />
    </div>
  );
}
