import { createSignal, createEffect, on, For, Show } from "solid-js";
import { Address, AddressPayload } from "../../../types/profile";
import { fetchAddressesApi, createAddressApi } from "../../../api/addresses";
import { authStore } from "../../auth/stores/authStore";
import { cartStore } from "../../cart/stores/cartStore";
import { localeStore } from "../../../stores/localeStore";
import { AddressModel, ZeptoAddressModal } from "../../profile/components/AddressModel";

export interface CheckoutAddressConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutAddressConfirmModal(props: CheckoutAddressConfirmModalProps) {
  // Steps: "address" (Mandatory confirmation) -> "payment" (Reachable only after confirmation)
  const [step, setStep] = createSignal<"address" | "payment">("address");

  const [addresses, setAddresses] = createSignal<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = createSignal<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = createSignal(false);
  const [isChangingAddress, setIsChangingAddress] = createSignal(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = createSignal(false);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = createSignal<"upi" | "card" | "netbanking" | "cod">("upi");
  const [isProcessingPayment, setIsProcessingPayment] = createSignal(false);

  // Load addresses whenever modal is opened
  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const data = await fetchAddressesApi(authStore.accessToken());
      setAddresses(data);

      // Auto-select default shipping address if not already selected, else first address
      if (data.length > 0) {
        const defaultShipping = data.find((a) => a.isDefaultShipping);
        setSelectedAddressId((prev) => {
          if (prev && data.some((a) => a.id === prev)) return prev;
          return defaultShipping ? defaultShipping.id : data[0].id;
        });
      } else {
        setSelectedAddressId(null);
      }
    } catch (err: any) {
      authStore.showToast(`Failed to load addresses: ${err.message}`);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  createEffect(
    on(
      () => props.isOpen,
      (open) => {
        if (open) {
          setStep("address");
          setIsChangingAddress(false);
          loadAddresses();
        }
      }
    )
  );

  const selectedAddress = () => addresses().find((a) => a.id === selectedAddressId()) || null;

  const handleSaveNewAddress = async (payload: AddressPayload) => {
    try {
      const created = await createAddressApi(payload, authStore.accessToken());
      authStore.showToast("New delivery address added!");
      await loadAddresses();
      if (created?.id) {
        setSelectedAddressId(created.id);
      }
      setIsChangingAddress(false);
    } catch (err: any) {
      authStore.showToast(err.message || "Failed to add address");
      throw err;
    }
  };

  // Mandatory Confirmation Action: Transitions to payment only after user explicitly confirms address
  const handleConfirmAddress = () => {
    if (!selectedAddress()) {
      alert("Please select or add a delivery address to proceed.");
      return;
    }
    setStep("payment");
  };

  // Payment Execution
  const handleCompletePayment = async () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      cartStore.clearCart();
      props.onClose();
      authStore.showToast("🎉 Order placed successfully! Delivering to your confirmed address.");
    }, 1200);
  };

  const getLabelBadgeStyle = (label: string) => {
    switch (label) {
      case "Home":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case "Work":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
      default:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        id="checkout-confirmation-modal"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div class="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-page)]/60">
            <div>
              <h3 class="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>{step() === "address" ? "Confirm Delivery Address" : "Payment & Finalize Order"}</span>
              </h3>
              <p class="text-xs text-[var(--text-secondary)] mt-0.5">
                {step() === "address"
                  ? "Step 1 of 2: Always confirm where your order should be delivered"
                  : "Step 2 of 2: Select payment method to complete purchase"}
              </p>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              class="w-7 h-7 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Close checkout"
            >
              ✕
            </button>
          </div>

          <div class="p-5 overflow-y-auto space-y-5 flex-1">
            {/* STEP 1: MANDATORY ADDRESS CONFIRMATION */}
            <Show when={step() === "address"}>
              <div class="space-y-4">
                <Show
                  when={!isLoadingAddresses()}
                  fallback={
                    <div class="py-12 text-center text-xs text-[var(--text-secondary)] animate-pulse">
                      Loading saved addresses...
                    </div>
                  }
                >
                  {/* Case A: Zero Saved Addresses */}
                  <Show when={addresses().length === 0}>
                    <div
                      id="checkout-zero-addresses-notice"
                      class="text-center py-8 px-4 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-page)]/50 space-y-3"
                    >
                      <div class="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl">
                        📍
                      </div>
                      <div class="space-y-1">
                        <h4 class="text-sm font-bold text-[var(--text-primary)]">No saved delivery address</h4>
                        <p class="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                          Please add your delivery address using the Zepto map pin picker before proceeding to payment.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="checkout-add-first-address-btn"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        class="px-5 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>📍</span>
                        <span>Add Delivery Address</span>
                      </button>
                    </div>
                  </Show>

                  {/* Case B: At Least One Saved Address */}
                  <Show when={addresses().length > 0 && selectedAddress()}>
                    {(() => {
                      const addr = selectedAddress()!;
                      return (
                        <div class="space-y-3">
                          {/* Deliver to Card */}
                          <div
                            id="confirmed-delivery-card"
                            class="p-4 rounded-2xl bg-[var(--bg-page)] border-2 border-[var(--brand-500)]/60 shadow-xs relative space-y-2.5"
                          >
                            <div class="flex items-center justify-between gap-2">
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase tracking-wider text-[var(--brand-600)]">
                                  Deliver to:
                                </span>
                                <span
                                  class={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getLabelBadgeStyle(
                                    addr.label
                                  )}`}
                                >
                                  {addr.label}
                                </span>
                              </div>

                              <button
                                type="button"
                                id="change-delivery-address-btn"
                                onClick={() => setIsChangingAddress(!isChangingAddress())}
                                class="text-xs font-bold text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isChangingAddress() ? "Done" : "Change?"}</span>
                              </button>
                            </div>

                            <div class="text-xs space-y-1">
                              <h4 class="font-bold text-[var(--text-primary)] text-sm">{addr.fullName}</h4>
                              <p class="text-[var(--text-secondary)]">{addr.phone}</p>
                              <p class="text-[var(--text-primary)] font-medium mt-1">
                                {addr.addressLine1}
                                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              </p>
                              <p class="text-[var(--text-secondary)]">
                                {addr.city}, {addr.state} - <span class="font-mono">{addr.postalCode}</span>
                              </p>
                              <p class="text-[var(--text-secondary)]">{addr.country}</p>
                            </div>
                          </div>

                          {/* Address Switcher Accordion (when user clicks Change) */}
                          <Show when={isChangingAddress()}>
                            <div class="space-y-2 p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] animate-in fade-in duration-150">
                              <div class="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                                <span class="text-xs font-bold text-[var(--text-primary)]">
                                  Select an Address ({addresses().length}/10)
                                </span>
                                <Show when={addresses().length < 10}>
                                  <button
                                    type="button"
                                    onClick={() => setIsAddAddressModalOpen(true)}
                                    class="text-[11px] font-bold text-[var(--brand-600)] hover:underline cursor-pointer"
                                  >
                                    + Add New
                                  </button>
                                </Show>
                              </div>

                              <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
                                <For each={addresses()}>
                                  {(a) => (
                                    <label
                                      class={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                        selectedAddressId() === a.id
                                          ? "border-[var(--brand-500)] bg-[var(--brand-50)]/30 dark:bg-[var(--brand-950)]/30"
                                          : "border-[var(--border)] hover:bg-[var(--bg-page)]"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name="checkout-selected-address"
                                        checked={selectedAddressId() === a.id}
                                        onChange={() => {
                                          setSelectedAddressId(a.id);
                                          setIsChangingAddress(false);
                                        }}
                                        class="mt-1 text-[var(--brand-600)] focus:ring-[var(--brand-500)]"
                                      />
                                      <div class="flex-1 min-w-0 text-xs">
                                        <div class="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                                          <span>{a.fullName}</span>
                                          <span class="text-[10px] text-[var(--text-secondary)]">({a.label})</span>
                                        </div>
                                        <p class="text-[11px] text-[var(--text-secondary)] truncate">
                                          {a.addressLine1}, {a.city} - {a.postalCode}
                                        </p>
                                      </div>
                                    </label>
                                  )}
                                </For>
                              </div>
                            </div>
                          </Show>

                          {/* Order Price Summary Snippet */}
                          <div class="p-3.5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-between text-xs">
                            <span class="text-[var(--text-secondary)] font-medium">Order Subtotal</span>
                            <span class="font-extrabold text-[var(--text-primary)] text-sm">
                              {localeStore.formatPrice(cartStore.subtotal())}
                            </span>
                          </div>

                          {/* Mandatory Confirmation Button Before Payment */}
                          <button
                            type="button"
                            id="confirm-checkout-address-btn"
                            onClick={handleConfirmAddress}
                            class="w-full py-3.5 rounded-2xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>✓</span>
                            <span>Confirm Address &amp; Proceed to Payment</span>
                          </button>
                        </div>
                      );
                    })()}
                  </Show>
                </Show>
              </div>
            </Show>

            {/* STEP 2: PAYMENT (UNREACHABLE WITHOUT EXPLICIT ADDRESS CONFIRMATION) */}
            <Show when={step() === "payment" && selectedAddress()}>
              {(() => {
                const addr = selectedAddress()!;
                return (
                  <div class="space-y-4 animate-in fade-in duration-150">
                    {/* Confirmed Delivery Destination Display */}
                    <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                      <span class="text-base text-emerald-600">✓</span>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold">Delivering to Confirmed Address:</p>
                        <p class="text-[11px] truncate mt-0.5">
                          {addr.fullName} ({addr.label}) — {addr.addressLine1}, {addr.city} {addr.postalCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("address")}
                        class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline shrink-0 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Payment Method Selector */}
                    <div class="space-y-2">
                      <label class="block text-xs font-bold text-[var(--text-primary)]">
                        Select Payment Method
                      </label>

                      <div class="space-y-2">
                        <label
                          class={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod() === "upi"
                              ? "border-[var(--brand-500)] bg-[var(--brand-50)]/40 dark:bg-[var(--brand-950)]/40"
                              : "border-[var(--border)] hover:bg-[var(--bg-page)]"
                          }`}
                        >
                          <div class="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="payment-method"
                              checked={paymentMethod() === "upi"}
                              onChange={() => setPaymentMethod("upi")}
                              class="text-[var(--brand-600)]"
                            />
                            <div class="text-xs">
                              <p class="font-bold text-[var(--text-primary)]">UPI / QR Code</p>
                              <p class="text-[10px] text-[var(--text-secondary)]">Google Pay, PhonePe, Paytm</p>
                            </div>
                          </div>
                          <span class="text-sm">⚡</span>
                        </label>

                        <label
                          class={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod() === "card"
                              ? "border-[var(--brand-500)] bg-[var(--brand-50)]/40 dark:bg-[var(--brand-950)]/40"
                              : "border-[var(--border)] hover:bg-[var(--bg-page)]"
                          }`}
                        >
                          <div class="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="payment-method"
                              checked={paymentMethod() === "card"}
                              onChange={() => setPaymentMethod("card")}
                              class="text-[var(--brand-600)]"
                            />
                            <div class="text-xs">
                              <p class="font-bold text-[var(--text-primary)]">Credit / Debit Card</p>
                              <p class="text-[10px] text-[var(--text-secondary)]">Visa, Mastercard, RuPay</p>
                            </div>
                          </div>
                          <span class="text-sm">💳</span>
                        </label>

                        <label
                          class={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod() === "cod"
                              ? "border-[var(--brand-500)] bg-[var(--brand-50)]/40 dark:bg-[var(--brand-950)]/40"
                              : "border-[var(--border)] hover:bg-[var(--bg-page)]"
                          }`}
                        >
                          <div class="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="payment-method"
                              checked={paymentMethod() === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              class="text-[var(--brand-600)]"
                            />
                            <div class="text-xs">
                              <p class="font-bold text-[var(--text-primary)]">Cash on Delivery</p>
                              <p class="text-[10px] text-[var(--text-secondary)]">Pay cash upon artisan arrival</p>
                            </div>
                          </div>
                          <span class="text-sm">💵</span>
                        </label>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      id="pay-and-place-order-btn"
                      onClick={handleCompletePayment}
                      disabled={isProcessingPayment()}
                      class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🔒</span>
                      <span>
                        {isProcessingPayment()
                          ? "Securing Payment..."
                          : `Pay ${localeStore.formatPrice(cartStore.subtotal())} & Place Order`}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </Show>
          </div>
        </div>

        {/* Nested Zepto Address Entry Modal if user adds an address during checkout */}
        <ZeptoAddressModal
          isOpen={isAddAddressModalOpen()}
          onClose={() => setIsAddAddressModalOpen(false)}
          onSave={handleSaveNewAddress}
          isFirstAddress={addresses().length === 0}
          defaultFullName={authStore.user() ? `${authStore.user()!.firstName} ${authStore.user()!.lastName}`.trim() : ""}
          defaultPhone={authStore.user()?.phoneNumber || ""}
        />
      </div>
    </Show>
  );
}
