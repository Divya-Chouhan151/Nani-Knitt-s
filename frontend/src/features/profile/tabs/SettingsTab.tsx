import { createSignal, onMount, Show } from "solid-js";
import { UserSettings } from "../../../types/profile";
import {
  fetchSettingsApi,
  updateSettingsApi,
  requestAccountDeletionApi,
  cancelAccountDeletionApi,
} from "../../../api/settings";
import { authStore } from "../../auth/stores/authStore";
import { PaymentMethodsSettings } from "../components/PaymentMethodsSettings";

export function SettingsTab() {
  const [settings, setSettings] = createSignal<UserSettings | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isSaving, setIsSaving] = createSignal(false);

  // Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = createSignal(false);
  const [deletePassword, setDeletePassword] = createSignal("");
  const [deleteConfirmation, setDeleteConfirmation] = createSignal("");
  const [isDeleting, setIsDeleting] = createSignal(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSettingsApi(authStore.accessToken());
      setSettings(data);
    } catch (err: any) {
      console.warn("Using default settings fallback", err);
      setSettings({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        orderUpdates: true,
        promotionalEmails: false,
        language: "en",
        currency: "INR",
        marketingConsent: true,
        dataSharingConsent: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  onMount(loadSettings);

  const handleToggle = (key: keyof UserSettings) => {
    if (!settings()) return;
    const current = settings()!;
    const updated = { ...current, [key]: !current[key] };
    setSettings(updated as UserSettings);
  };

  const handleSelectChange = (key: "language" | "currency", val: string) => {
    if (!settings()) return;
    setSettings({ ...settings()!, [key]: val });
  };

  const handleSave = async () => {
    if (!settings()) return;
    setIsSaving(true);
    try {
      await updateSettingsApi(settings()!, authStore.accessToken());
      authStore.showToast("Settings updated successfully!");
    } catch (err: any) {
      authStore.showToast(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (deleteConfirmation() !== "DELETE" || !deletePassword()) {
      authStore.showToast("Please type 'DELETE' and enter your password");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await requestAccountDeletionApi(
        { password: deletePassword(), confirmation: deleteConfirmation() },
        authStore.accessToken()
      );
      authStore.showToast(res.message);
      setIsDeleteModalOpen(false);
      setDeletePassword("");
      setDeleteConfirmation("");
      await loadSettings();
    } catch (err: any) {
      authStore.showToast(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      const res = await cancelAccountDeletionApi(authStore.accessToken());
      authStore.showToast(res.message);
      await loadSettings();
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  return (
    <div class="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">Preferences & Settings</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          Customize communications, currency/language locales, privacy policies, and account lifecycle.
        </p>
      </div>

      {/* Payment Methods Section (UPI & Cards) - Always rendered and independent */}
      <PaymentMethodsSettings />

      <hr class="border-[var(--border)]" />

      <Show
        when={!isLoading() && settings()}
        fallback={<div class="py-12 text-center text-xs text-[var(--text-secondary)]">Loading settings...</div>}
      >
        {(() => {
          const s = settings()!;
          return (
            <div class="space-y-8">
              {/* Account Deletion Pending Banner */}
              <Show when={s.scheduledPurgeAt}>
                <div class="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                      <span>⚠️ Account Scheduled for Deletion</span>
                    </div>
                    <p class="text-xs text-[var(--text-secondary)]">
                      Your account is currently in a 30-day grace period and will be purged on{" "}
                      <strong class="text-[var(--text-primary)]">{new Date(s.scheduledPurgeAt!).toLocaleDateString()}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelDeletion}
                    class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                  >
                    Cancel Deletion & Keep Account
                  </button>
                </div>
              </Show>

              {/* Notification Preferences */}
              <div class="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-4">
                <h3 class="text-sm font-bold text-[var(--text-primary)]">Notification Channels</h3>
                <p class="text-xs text-[var(--text-secondary)]">
                  Choose how and when you receive transactional updates and store announcements.
                </p>

                <div class="divide-y divide-[var(--border)]/60 text-xs">
                  <div class="py-3 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">Order Status & Shipping Updates</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Crucial delivery milestones and receipts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.orderUpdates}
                      onChange={() => handleToggle("orderUpdates")}
                      class="w-4 h-4 rounded text-[var(--brand-600)] cursor-pointer"
                    />
                  </div>

                  <div class="py-3 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">Email Notifications</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Receive order invoices and account security alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.emailNotifications}
                      onChange={() => handleToggle("emailNotifications")}
                      class="w-4 h-4 rounded text-[var(--brand-600)] cursor-pointer"
                    />
                  </div>

                  <div class="py-3 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">SMS Text Messages</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Instant OTPs and out-for-delivery alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.smsNotifications}
                      onChange={() => handleToggle("smsNotifications")}
                      class="w-4 h-4 rounded text-[var(--brand-600)] cursor-pointer"
                    />
                  </div>

                  <div class="py-3 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">Browser Push Notifications</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Real-time alerts when your order ships</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.pushNotifications}
                      onChange={() => handleToggle("pushNotifications")}
                      class="w-4 h-4 rounded text-[var(--brand-600)] cursor-pointer"
                    />
                  </div>

                  <div class="py-3 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">Promotional Discounts & Weekly Deals</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Curated newsletters and member-exclusive flash sales</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={s.promotionalEmails}
                      onChange={() => handleToggle("promotionalEmails")}
                      class="w-4 h-4 rounded text-[var(--brand-600)] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Preferences */}
              <div class="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-4">
                <h3 class="text-sm font-bold text-[var(--text-primary)]">Privacy & Data Governance</h3>

                <div class="space-y-3 text-xs">
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.marketingConsent}
                      onChange={() => handleToggle("marketingConsent")}
                      class="mt-0.5 rounded text-[var(--brand-600)]"
                    />
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">Personalized Recommendations</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Allow us to tailor product highlights based on your browsing history</p>
                    </div>
                  </label>

                  <label class="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.dataSharingConsent}
                      onChange={() => handleToggle("dataSharingConsent")}
                      class="mt-0.5 rounded text-[var(--brand-600)]"
                    />
                    <div>
                      <p class="font-bold text-[var(--text-primary)]">Third-Party Analytics</p>
                      <p class="text-[11px] text-[var(--text-secondary)]">Help us improve web performance and error diagnostics anonymously</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Save Preferences Button */}
              <div class="flex justify-end">
                <button
                  type="button"
                  disabled={isSaving()}
                  onClick={handleSave}
                  class="px-6 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSaving() ? "Saving Settings..." : "Save Preferences"}
                </button>
              </div>

              <hr class="border-[var(--border)]" />

              {/* Account Deletion Area */}
              <div class="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <h3 class="text-sm font-bold text-rose-600 dark:text-rose-400">Danger Zone: Account Deactivation & Deletion</h3>
                <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Requesting account deletion initiates a 30-day retention grace period. All active sessions are immediately terminated. You can cancel deletion anytime within the 30-day window by simply logging back in.
                </p>
                <div class="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Request Account Deletion
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Show>

      {/* Account Deletion Confirmation Modal */}
      <Show when={isDeleteModalOpen()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 class="text-base font-bold text-rose-600 dark:text-rose-400">Confirm Account Deletion</h3>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
              This action will schedule your account for permanent erasure after a <strong>30-day grace period</strong>. Your profile data, addresses, and wishlist will be purged.
            </p>

            <div class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Type <span class="font-mono text-rose-600 dark:text-rose-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation()}
                  onInput={(e) => setDeleteConfirmation(e.currentTarget.value)}
                  placeholder="DELETE"
                  class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Confirm Account Password
                </label>
                <input
                  type="password"
                  value={deletePassword()}
                  onInput={(e) => setDeletePassword(e.currentTarget.value)}
                  placeholder="Your password"
                  class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmation() !== "DELETE" || !deletePassword() || isDeleting()}
                  onClick={handleRequestDeletion}
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-40"
                >
                  {isDeleting() ? "Scheduling..." : "Schedule Deletion (30 Days)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
