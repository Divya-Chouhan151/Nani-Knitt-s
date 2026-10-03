import { createSignal, onMount, For, Show } from "solid-js";
import { Address, AddressPayload } from "../../../types/profile";
import {
  fetchAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultShippingApi,
  setDefaultBillingApi,
} from "../../../api/addresses";
import { authStore } from "../../auth/stores/authStore";
import { AddressModel, ZeptoAddressModal } from "../components/AddressModel";

export const MAX_SAVED_ADDRESSES = 10;

export function AddressesTab() {
  const [addresses, setAddresses] = createSignal<Address[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingAddress, setEditingAddress] = createSignal<Address | null>(null);

  const isAtLimit = () => addresses().length >= MAX_SAVED_ADDRESSES;

  // Delete confirmation modal
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAddressesApi(authStore.accessToken());
      setAddresses(data);
    } catch (err: any) {
      authStore.showToast(`Failed to load addresses: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(loadAddresses);

  // Both Empty-State CTA and Regular "+ Add Address" trigger this same Zepto flow
  const openAddModal = () => {
    if (isAtLimit()) {
      authStore.showToast("You've reached the maximum number of saved addresses (10). Remove one to add a new one.");
      return;
    }
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (payload: AddressPayload) => {
    try {
      if (editingAddress()) {
        await updateAddressApi(editingAddress()!.id, payload, authStore.accessToken());
        authStore.showToast("Address updated successfully!");
      } else {
        await createAddressApi(payload, authStore.accessToken());
        authStore.showToast("Address added successfully!");
      }
      await loadAddresses();
    } catch (err: any) {
      authStore.showToast(err.message || "Failed to save address");
      throw err;
    }
  };

  const handleDelete = async () => {
    const id = deletingId();
    if (!id) return;
    try {
      await deleteAddressApi(id, authStore.accessToken());
      setDeletingId(null);
      authStore.showToast("Address deleted");
      await loadAddresses();
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  const handleSetDefaultShipping = async (id: string) => {
    try {
      await setDefaultShippingApi(id, authStore.accessToken());
      authStore.showToast("Default shipping address updated");
      await loadAddresses();
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  const handleSetDefaultBilling = async (id: string) => {
    try {
      await setDefaultBillingApi(id, authStore.accessToken());
      authStore.showToast("Default billing address updated");
      await loadAddresses();
    } catch (err: any) {
      authStore.showToast(err.message);
    }
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

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "Home":
        return "🏠";
      case "Work":
        return "💼";
      default:
        return "📍";
    }
  };

  return (
    <div class="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>Addresses</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--brand-50)] dark:bg-[var(--brand-950)] text-[var(--brand-600)] border border-[var(--brand-200)] dark:border-[var(--brand-800)]">
              {addresses().length} saved
            </span>
          </h1>
          <p class="text-xs text-[var(--text-secondary)] mt-1">
            Manage your delivery destinations with precise Google Maps pinpointing and default billing details.
          </p>
        </div>

        {/* Regular "Add Address" Action (Used once at least one address exists or anytime) */}
        <Show
          when={!isAtLimit()}
          fallback={
            <div
              id="address-limit-indicator"
              class="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>⚠️</span>
              <span>Address Limit Reached (10/10)</span>
            </div>
          }
        >
          <button
            type="button"
            id="add-address-btn"
            onClick={openAddModal}
            class="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <span>📍 + Add Address</span>
          </button>
        </Show>
      </div>

      {/* 10-Address Limit Warning Message Banner */}
      <Show when={isAtLimit()}>
        <div
          id="address-limit-warning"
          class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3 shadow-xs"
        >
          <span class="text-xl">⚠️</span>
          <div>
            <p class="font-bold">Maximum Address Limit Reached (10)</p>
            <p class="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              You've reached the maximum number of saved addresses. Remove one to add a new one.
            </p>
          </div>
        </div>
      </Show>

      <Show
        when={!isLoading()}
        fallback={
          <div class="py-16 text-center text-xs text-[var(--text-secondary)] animate-pulse">
            Loading your address book...
          </div>
        }
      >
        <Show
          when={addresses().length > 0}
          fallback={
            /* Empty-State CTA: Shown when the user has no saved addresses yet */
            <div
              id="empty-addresses-state"
              class="py-16 text-center border-2 border-dashed border-[var(--border)] rounded-3xl p-8 space-y-4 bg-[var(--bg-page)]/40"
            >
              <div class="w-16 h-16 mx-auto rounded-2xl bg-[var(--brand-50)] dark:bg-[var(--brand-950)] border border-[var(--brand-200)] dark:border-[var(--brand-800)] flex items-center justify-center text-3xl shadow-xs">
                📍
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-bold text-[var(--text-primary)]">No addresses saved yet</h3>
                <p class="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                  Pinpoint your exact delivery location on Google Maps to enjoy seamless 1-click checkout and artisan deliveries.
                </p>
              </div>
              <button
                type="button"
                id="empty-state-add-address-btn"
                onClick={openAddModal}
                class="px-5 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>🗺️</span>
                <span>Add Your First Address</span>
              </button>
            </div>
          }
        >
          {/* Address Cards Grid: Supports multiple addresses under Home, Work, and Other */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <For each={addresses()}>
              {(addr) => (
                <div
                  data-address-id={addr.id}
                  class={`p-5 rounded-2xl bg-[var(--bg-page)] border relative flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-md ${
                    addr.isDefaultShipping
                      ? "border-[var(--brand-500)]/60 ring-1 ring-[var(--brand-500)]/20 shadow-xs"
                      : "border-[var(--border)] hover:border-[var(--brand-500)]/40"
                  }`}
                >
                  <div>
                    {/* Header: Label & Default Badges */}
                    <div class="flex items-center justify-between gap-2 mb-3">
                      <span
                        class={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-2xs ${getLabelBadgeStyle(
                          addr.label
                        )}`}
                      >
                        <span>{getLabelIcon(addr.label)}</span>
                        <span>{addr.label}</span>
                      </span>

                      <div class="flex items-center gap-1.5 flex-wrap justify-end">
                        <Show when={addr.isDefaultShipping}>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                            Default Shipping
                          </span>
                        </Show>
                        <Show when={addr.isDefaultBilling}>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
                            Default Billing
                          </span>
                        </Show>
                      </div>
                    </div>

                    {/* Recipient info */}
                    <h4 class="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span>{addr.fullName}</span>
                    </h4>
                    <p class="text-xs text-[var(--text-secondary)] mt-0.5 font-medium flex items-center gap-1">
                      <span>📞</span>
                      <span>{addr.phone}</span>
                    </p>

                    {/* Full Structured Address */}
                    <div class="text-xs text-[var(--text-primary)] mt-3 leading-relaxed bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border)]/60">
                      <p class="font-medium">{addr.addressLine1}</p>
                      <Show when={addr.addressLine2}>
                        <p class="text-[var(--text-secondary)]">{addr.addressLine2}</p>
                      </Show>
                      <p class="text-[var(--text-secondary)] mt-1">
                        {addr.city}, {addr.state} - <span class="font-mono">{addr.postalCode}</span>
                      </p>
                      <p class="text-[var(--text-secondary)]">{addr.country}</p>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div class="pt-3 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2 flex-wrap">
                      <Show when={!addr.isDefaultShipping}>
                        <button
                          type="button"
                          onClick={() => handleSetDefaultShipping(addr.id)}
                          class="text-[11px] font-semibold text-[var(--brand-600)] hover:underline cursor-pointer"
                        >
                          Make Shipping Default
                        </button>
                      </Show>
                      <Show when={!addr.isDefaultBilling}>
                        <button
                          type="button"
                          onClick={() => handleSetDefaultBilling(addr.id)}
                          class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Make Billing Default
                        </button>
                      </Show>
                    </div>

                    <div class="flex items-center gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => openEditModal(addr)}
                        class="p-2 rounded-xl hover:bg-[var(--border)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        title="Edit address"
                        aria-label={`Edit ${addr.label} address`}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(addr.id)}
                        class="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                        title="Delete address"
                        aria-label={`Delete ${addr.label} address`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Zepto-Style 2-Step Address Entry & Edit Modal */}
      <ZeptoAddressModal
        isOpen={isModalOpen()}
        editingAddress={editingAddress()}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        isFirstAddress={addresses().length === 0}
        defaultFullName={authStore.user() ? `${authStore.user()!.firstName} ${authStore.user()!.lastName}`.trim() : ""}
        defaultPhone={authStore.user()?.phoneNumber || ""}
      />

      {/* Delete Confirmation Modal */}
      <Show when={deletingId()}>
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl">
              🗑️
            </div>
            <div class="space-y-1">
              <h3 class="text-sm font-bold text-[var(--text-primary)]">Delete Address?</h3>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to remove this delivery address? Existing historical orders referencing this address will remain intact.
              </p>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
