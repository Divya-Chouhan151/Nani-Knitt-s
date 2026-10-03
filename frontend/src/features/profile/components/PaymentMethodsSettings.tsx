import { createSignal, onMount, Show, For } from "solid-js";
import { PaymentMethod, VpaValidationResult } from "../../../types/profile";
import {
  fetchPaymentMethodsApi,
  validateVpaApi,
  addUpiPaymentMethodApi,
  setDefaultPaymentMethodApi,
  deletePaymentMethodApi,
} from "../../../api/paymentMethods";
import { authStore } from "../../auth/stores/authStore";

const VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export function PaymentMethodsSettings() {
  const [methods, setMethods] = createSignal<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  // Add UPI Form State
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [vpaInput, setVpaInput] = createSignal("");
  const [isVerifying, setIsVerifying] = createSignal(false);
  const [verificationResult, setVerificationResult] = createSignal<VpaValidationResult | null>(null);
  const [verifyError, setVerifyError] = createSignal<string | null>(null);
  const [isDefaultCheck, setIsDefaultCheck] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // Delete Modal State
  const [methodToDelete, setMethodToDelete] = createSignal<PaymentMethod | null>(null);
  const [isDeleting, setIsDeleting] = createSignal(false);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPaymentMethodsApi(authStore.accessToken());
      setMethods(data || []);
    } catch (err: any) {
      console.error("Failed to load payment methods", err);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(loadPaymentMethods);

  const isVpaValidFormat = () => VPA_REGEX.test(vpaInput().trim());

  const handleVerifyVpa = async (e: Event) => {
    e.preventDefault();
    if (!isVpaValidFormat()) {
      setVerifyError("Please enter a valid UPI ID (e.g. username@okhdfcbank)");
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setVerificationResult(null);

    try {
      const res = await validateVpaApi(vpaInput().trim(), authStore.accessToken());
      if (res.isValid) {
        setVerificationResult(res);
      } else {
        setVerifyError(res.message || "We couldn't verify this UPI ID. Please check and try again.");
      }
    } catch (err: any) {
      setVerifyError(err.message || "We couldn't verify this UPI ID. Please check and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmSave = async () => {
    const verified = verificationResult();
    if (!verified || !verified.vpa) return;

    setIsSaving(true);
    try {
      await addUpiPaymentMethodApi(
        { vpa: verified.vpa, isDefault: isDefaultCheck() },
        authStore.accessToken()
      );
      authStore.showToast("UPI ID saved successfully! 🎉");
      resetAddForm();
      await loadPaymentMethods();
    } catch (err: any) {
      authStore.showToast(`Failed to save UPI ID: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setVpaInput("");
    setVerificationResult(null);
    setVerifyError(null);
    setIsDefaultCheck(false);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethodApi(id, authStore.accessToken());
      authStore.showToast("Default payment method updated");
      await loadPaymentMethods();
    } catch (err: any) {
      authStore.showToast(err.message || "Failed to set default payment method");
    }
  };

  const handleConfirmDelete = async () => {
    const item = methodToDelete();
    if (!item) return;

    setIsDeleting(true);
    try {
      await deletePaymentMethodApi(item.id, authStore.accessToken());
      authStore.showToast("Payment method removed");
      setMethodToDelete(null);
      await loadPaymentMethods();
    } catch (err: any) {
      authStore.showToast(err.message || "Failed to remove payment method");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="payment-methods" class="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-6 scroll-mt-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>💳</span> Payment Methods
          </h3>
          <p class="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage your saved UPI IDs and payment options for faster 1-click checkout.
          </p>
        </div>
        <Show when={!showAddForm()}>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            class="px-3.5 py-1.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <span>+</span> Add UPI ID
          </button>
        </Show>
      </div>

      {/* Add UPI Form */}
      <Show when={showAddForm()}>
        <div class="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4 animate-in fade-in duration-150">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[var(--text-primary)]">Add New UPI ID</h4>
            <button
              type="button"
              onClick={resetAddForm}
              class="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleVerifyVpa} class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                UPI ID (Virtual Payment Address) *
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={vpaInput()}
                  onInput={(e) => {
                    setVpaInput(e.currentTarget.value);
                    setVerifyError(null);
                    setVerificationResult(null);
                  }}
                  placeholder="username@okhdfcbank"
                  class="flex-1 bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                  disabled={isVerifying() || isSaving()}
                />
                <button
                  type="submit"
                  disabled={!isVpaValidFormat() || isVerifying()}
                  class="px-4 py-2 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isVerifying() ? "Verifying..." : "Verify UPI ID"}
                </button>
              </div>
              <p class="text-[10px] text-[var(--text-tertiary)] mt-1">
                Supported handles: @okhdfcbank, @okicici, @oksbi, @okaxis, @paytm, @ybl, etc.
              </p>
            </div>

            {/* Verification Error */}
            <Show when={verifyError()}>
              <div class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {verifyError()}
              </div>
            </Show>

            {/* Verification Success & Confirmation */}
            <Show when={verificationResult()}>
              {(() => {
                const res = verificationResult()!;
                return (
                  <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in fade-in duration-150">
                    <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <span>✓ Verified with Gateway</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span class="text-[10px] text-[var(--text-secondary)] block">Account Holder Name</span>
                        <span class="font-bold text-[var(--text-primary)]">{res.accountHolderName}</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-[var(--text-secondary)] block">Linked Bank</span>
                        <span class="font-bold text-[var(--text-primary)]">{res.bankName}</span>
                      </div>
                    </div>

                    <label class="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={isDefaultCheck()}
                        onChange={(e) => setIsDefaultCheck(e.currentTarget.checked)}
                        class="w-4 h-4 rounded text-[var(--brand-600)]"
                      />
                      <span class="text-xs text-[var(--text-primary)] font-medium">
                        Set as default payment method
                      </span>
                    </label>

                    <div class="flex items-center justify-end gap-2 pt-2 border-t border-emerald-500/20">
                      <button
                        type="button"
                        onClick={resetAddForm}
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[var(--border)]/30"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSave}
                        disabled={isSaving()}
                        class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        {isSaving() ? "Saving..." : "Confirm & Save UPI ID"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </Show>
          </form>
        </div>
      </Show>

      {/* Methods List */}
      <Show
        when={!isLoading()}
        fallback={<div class="py-6 text-center text-xs text-[var(--text-secondary)]">Loading payment methods...</div>}
      >
        <Show
          when={methods().length > 0}
          fallback={
            <div class="text-center py-8 px-4 rounded-xl border border-dashed border-[var(--border)]">
              <span class="text-3xl block mb-2">⚡</span>
              <p class="text-xs font-bold text-[var(--text-primary)]">No payment methods saved yet</p>
              <p class="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Add your UPI ID above to enable rapid, secure 1-click checkout.
              </p>
            </div>
          }
        >
          <div class="space-y-3">
            <For each={methods()}>
              {(method) => (
                <div class="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--brand-500)]/40">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[var(--brand-500)]/10 text-[var(--brand-600)] flex items-center justify-center font-bold text-base shrink-0">
                      ₹
                    </div>
                    <div class="space-y-0.5">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold text-[var(--text-primary)]">
                          {method.maskedVpa || method.vpa}
                        </span>
                        <Show when={method.isVerified}>
                          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            ✓ Verified
                          </span>
                        </Show>
                        <Show when={method.isDefault}>
                          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--brand-500)]/15 text-[var(--brand-600)] border border-[var(--brand-500)]/30">
                            Default
                          </span>
                        </Show>
                      </div>
                      <p class="text-[11px] text-[var(--text-secondary)]">
                        {method.accountHolderName} • {method.bankName}
                      </p>
                      <p class="text-[10px] text-[var(--text-tertiary)]">
                        Added on {new Date(method.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end sm:self-center">
                    <Show when={!method.isDefault}>
                      <button
                        type="button"
                        onClick={() => handleSetDefault(method.id)}
                        class="px-2.5 py-1.5 rounded-lg bg-[var(--bg-page)] hover:bg-[var(--border)]/50 border border-[var(--border)] text-[11px] font-semibold transition-all"
                      >
                        Set as Default
                      </button>
                    </Show>
                    <button
                      type="button"
                      onClick={() => setMethodToDelete(method)}
                      class="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold transition-all"
                      title="Remove payment method"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Remove Confirmation Modal */}
      <Show when={methodToDelete()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 class="text-sm font-bold text-[var(--text-primary)]">Remove Payment Method?</h3>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to remove <strong class="text-[var(--text-primary)]">{methodToDelete()?.maskedVpa}</strong>? It will no longer be available for 1-click checkout.
            </p>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMethodToDelete(null)}
                class="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting()}
                onClick={handleConfirmDelete}
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isDeleting() ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
