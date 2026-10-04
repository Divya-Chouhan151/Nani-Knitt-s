import { createSignal, onMount, For, Show } from "solid-js";
import { SecurityEvent, Session, TwoFactorSetup } from "../../../types/profile";
import {
  changePasswordApi,
  fetchActiveSessionsApi,
  revokeSessionApi,
  initiate2FaSetupApi,
  confirm2FaApi,
  disable2FaApi,
  fetchSecurityLogsApi,
} from "../../../api/security";
import { authStore } from "../../auth/stores/authStore";

export function SecurityTab() {
  // Password change state
  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [isChangingPassword, setIsChangingPassword] = createSignal(false);

  // Sessions state
  const [sessions, setSessions] = createSignal<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = createSignal(true);
  const [revokingId, setRevokingId] = createSignal<string | null>(null);

  // 2FA state
  const [is2FaEnabled, setIs2FaEnabled] = createSignal(false);
  const [twoFaSetup, setTwoFaSetup] = createSignal<TwoFactorSetup | null>(null);
  const [twoFaCode, setTwoFaCode] = createSignal("");
  const [isSettingUp2Fa, setIsSettingUp2Fa] = createSignal(false);
  const [is2FaModalOpen, setIs2FaModalOpen] = createSignal(false);
  const [backupCodesToShow, setBackupCodesToShow] = createSignal<string[] | null>(null);

  // Disable 2FA modal
  const [isDisableModalOpen, setIsDisableModalOpen] = createSignal(false);
  const [disablePassword, setDisablePassword] = createSignal("");

  // Audit logs state
  const [logs, setLogs] = createSignal<SecurityEvent[]>([]);

  const loadSecurityData = async (initial = false) => {
    if (initial) setIsLoadingSessions(true);
    setIs2FaEnabled(Boolean(authStore.user()?.twoFactorEnabled));
    try {
      const [sess, audit] = await Promise.all([
        fetchActiveSessionsApi(authStore.accessToken()),
        fetchSecurityLogsApi(authStore.accessToken()),
      ]);
      setSessions(sess);
      setLogs(audit);
    } catch (err: any) {
      console.error("Failed to load security data", err);
    } finally {
      if (initial) setIsLoadingSessions(false);
    }
  };

  onMount(() => {
    loadSecurityData(true);
  });

  // Password strength calculator
  const passwordStrength = () => {
    const p = newPassword();
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[0-9]/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  };

  const strengthColor = () => {
    const s = passwordStrength();
    if (s <= 25) return "bg-rose-500";
    if (s <= 50) return "bg-amber-500";
    if (s <= 75) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const strengthLabel = () => {
    const s = passwordStrength();
    if (s === 0) return "";
    if (s <= 25) return "Weak";
    if (s <= 50) return "Fair";
    if (s <= 75) return "Good";
    return "Strong";
  };

  const handleChangePassword = async (e: Event) => {
    e.preventDefault();
    if (newPassword() !== confirmPassword()) {
      authStore.showToast("New passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await changePasswordApi(
        {
          currentPassword: currentPassword(),
          newPassword: newPassword(),
          confirmPassword: confirmPassword(),
        },
        authStore.accessToken()
      );
      authStore.showToast(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await loadSecurityData();
    } catch (err: any) {
      authStore.showToast(`Error: ${err.message}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    if (revokingId()) return;
    setRevokingId(id);
    try {
      await revokeSessionApi(id, authStore.accessToken());
      authStore.showToast("Session revoked");
      // Optimistically remove session from local state so the page never reloads or flickers
      setSessions((prev) => prev.filter((s) => s.id !== id));
      // Silently refresh security logs in the background without resetting session list state
      fetchSecurityLogsApi(authStore.accessToken()).then(setLogs).catch(() => {});
    } catch (err: any) {
      authStore.showToast(err.message || "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const start2FaSetup = async () => {
    setIsSettingUp2Fa(true);
    try {
      const setup = await initiate2FaSetupApi(authStore.accessToken());
      setTwoFaSetup(setup);
      setIs2FaModalOpen(true);
    } catch (err: any) {
      authStore.showToast(err.message);
    } finally {
      setIsSettingUp2Fa(false);
    }
  };

  const confirm2Fa = async () => {
    if (!twoFaCode() || twoFaCode().length !== 6) {
      authStore.showToast("Please enter a 6-digit code");
      return;
    }
    try {
      await confirm2FaApi(twoFaCode(), authStore.accessToken());
      setIs2FaEnabled(true);
      if (authStore.user()) {
        authStore.user()!.twoFactorEnabled = true;
      }
      setBackupCodesToShow(twoFaSetup()?.backupCodes || []);
      setIs2FaModalOpen(false);
      setTwoFaCode("");
      authStore.showToast("Two-Factor Authentication activated!");
      await loadSecurityData();
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  const handleDisable2Fa = async () => {
    if (!disablePassword()) return;
    try {
      await disable2FaApi(disablePassword(), authStore.accessToken());
      setIs2FaEnabled(false);
      if (authStore.user()) {
        authStore.user()!.twoFactorEnabled = false;
      }
      setIsDisableModalOpen(false);
      setDisablePassword("");
      authStore.showToast("Two-Factor Authentication disabled");
      await loadSecurityData();
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  return (
    <div class="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">Login & Security</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          Manage credentials, active device authorizations, two-factor authentication, and security audit logs.
        </p>
      </div>

      {/* 2FA Status Card */}
      <div class="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-[var(--text-primary)]">Two-Factor Authentication (2FA)</span>
            <Show
              when={is2FaEnabled()}
              fallback={
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                  Disabled
                </span>
              }
            >
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Enabled & Active
              </span>
            </Show>
          </div>
          <p class="text-xs text-[var(--text-secondary)]">
            Protects your account by requiring an authenticator app code (Google Authenticator, Authy, or 1Password) at login.
          </p>
        </div>

        <Show
          when={is2FaEnabled()}
          fallback={
            <button
              type="button"
              onClick={start2FaSetup}
              disabled={isSettingUp2Fa()}
              class="px-4 py-2 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all flex-shrink-0"
            >
              {isSettingUp2Fa() ? "Generating..." : "Set up 2FA"}
            </button>
          }
        >
          <button
            type="button"
            onClick={() => setIsDisableModalOpen(true)}
            class="px-4 py-2 rounded-xl bg-rose-600/10 text-rose-600 hover:bg-rose-600/20 text-xs font-bold transition-all flex-shrink-0"
          >
            Disable 2FA
          </button>
        </Show>
      </div>

      {/* Backup codes modal reminder */}
      <Show when={backupCodesToShow()}>
        <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <span>⚠️ Save Your Backup Codes</span>
          </div>
          <p class="text-xs text-[var(--text-secondary)]">
            Keep these single-use recovery codes in a secure location. You can use them if you lose access to your authenticator app:
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center font-bold bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border)]">
            <For each={backupCodesToShow()!}>
              {(c) => <span class="tracking-wider">{c}</span>}
            </For>
          </div>
          <button
            type="button"
            onClick={() => setBackupCodesToShow(null)}
            class="text-xs font-bold text-[var(--brand-600)] hover:underline"
          >
            I have stored my backup codes safely ✓
          </button>
        </div>
      </Show>

      {/* Change Password Form */}
      <div class="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-4">
        <h3 class="text-sm font-bold text-[var(--text-primary)]">Change Password</h3>

        <form onSubmit={handleChangePassword} class="space-y-4 max-w-md">
          <div>
            <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword()}
              onInput={(e) => setCurrentPassword(e.currentTarget.value)}
              required
              class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword()}
              onInput={(e) => setNewPassword(e.currentTarget.value)}
              required
              class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
            {/* Password Strength Meter */}
            <Show when={newPassword()}>
              <div class="mt-2 space-y-1">
                <div class="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>Strength:</span>
                  <span class="font-bold">{strengthLabel()}</span>
                </div>
                <div class="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    class={`h-full transition-all duration-300 ${strengthColor()}`}
                    style={{ width: `${passwordStrength()}%` }}
                  ></div>
                </div>
              </div>
            </Show>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              required
              class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <button
            type="submit"
            disabled={!currentPassword() || !newPassword() || newPassword() !== confirmPassword() || isChangingPassword()}
            class="px-5 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md transition-all disabled:opacity-40"
          >
            {isChangingPassword() ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-[var(--text-primary)]">Active Devices & Sessions</h3>
        <p class="text-xs text-[var(--text-secondary)]">
          Signed-in browser sessions. You can revoke any unrecognized device to invalidate its access.
        </p>

        <div class="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-page)] divide-y divide-[var(--border)]/60">
          <Show
            when={!isLoadingSessions()}
            fallback={<div class="p-6 text-center text-xs text-[var(--text-secondary)]">Loading sessions...</div>}
          >
            <Show
              when={sessions().length > 0}
              fallback={
                <div class="p-6 text-center text-xs text-[var(--text-secondary)]">
                  Only current session active.
                </div>
              }
            >
              <For each={sessions()}>
                {(sess) => (
                  <div class="p-4 flex items-center justify-between gap-4 text-xs">
                    <div class="flex items-center gap-3">
                      <span class="text-xl">💻</span>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-[var(--text-primary)]">{sess.ipAddress}</span>
                          <span class="text-[10px] text-[var(--text-secondary)] truncate max-w-xs block">
                            {sess.userAgent}
                          </span>
                        </div>
                        <span class="text-[10px] text-[var(--text-secondary)]">
                          Active since {new Date(sess.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Show
                      when={!sess.isCurrent}
                      fallback={
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shadow-2xs">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Current Session
                        </span>
                      }
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRevokeSession(sess.id);
                        }}
                        disabled={revokingId() === sess.id}
                        class="px-3 py-1 rounded-lg hover:bg-rose-500/10 text-rose-500 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {revokingId() === sess.id ? "Revoking..." : "Revoke"}
                      </button>
                    </Show>
                  </div>
                )}
              </For>
            </Show>
          </Show>
        </div>
      </div>

      {/* 2FA Setup Wizard Modal */}
      <Show when={is2FaModalOpen() && twoFaSetup()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 class="text-base font-bold text-[var(--text-primary)]">Enable Two-Factor Authentication</h3>
            <p class="text-xs text-[var(--text-secondary)]">
              Scan this configuration key in Google Authenticator, Authy, or copy the manual key:
            </p>

            <div class="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] text-center space-y-3">
              <div class="p-4 bg-white rounded-xl inline-block shadow-sm">
                <div class="w-36 h-36 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 text-xs text-center p-2">
                  <span class="font-mono text-[9px] break-all text-slate-800 font-bold">
                    {twoFaSetup()!.secret}
                  </span>
                </div>
              </div>
              <div>
                <span class="text-[11px] text-[var(--text-secondary)] block">Manual Setup Key:</span>
                <code class="text-xs font-mono font-bold text-[var(--brand-600)] tracking-wider">
                  {twoFaSetup()!.secret}
                </code>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Enter 6-digit confirmation code
              </label>
              <input
                type="text"
                maxLength={6}
                value={twoFaCode()}
                onInput={(e) => setTwoFaCode(e.currentTarget.value)}
                placeholder="123456"
                class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] text-center tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
              />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIs2FaModalOpen(false)}
                class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm2Fa}
                class="px-4 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold"
              >
                Confirm & Enable
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Disable 2FA Modal */}
      <Show when={isDisableModalOpen()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 class="text-sm font-bold text-[var(--text-primary)]">Disable 2FA?</h3>
            <p class="text-xs text-[var(--text-secondary)]">
              Confirm your password to turn off Two-Factor Authentication:
            </p>
            <input
              type="password"
              value={disablePassword()}
              onInput={(e) => setDisablePassword(e.currentTarget.value)}
              placeholder="Your password"
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-2.5 text-xs text-[var(--text-primary)]"
            />
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDisableModalOpen(false)}
                class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisable2Fa}
                class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
