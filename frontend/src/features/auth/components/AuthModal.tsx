import { createSignal, Show, onCleanup, onMount } from "solid-js";
import { authStore } from "../stores/authStore";

export function AuthModal() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [localError, setLocalError] = createSignal<string | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && authStore.isAuthModalOpen()) {
      authStore.closeAuthModal();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
    setLocalError(null);
  };

  const handleSwitchMode = (mode: "login" | "register") => {
    authStore.setAuthModalMode(mode);
    setLocalError(null);
  };

  const fillMasterAccount = () => {
    setEmail("admin");
    setPassword("admin");
    setLocalError(null);
    if (authStore.authModalMode() !== "login") {
      authStore.setAuthModalMode("login");
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLocalError(null);

    if (authStore.authModalMode() === "login") {
      if (!email() || !password()) {
        setLocalError("Please enter both email and password");
        return;
      }
      try {
        await authStore.login({ email: email().trim(), password: password() });
        resetForm();
      } catch {
        // Handled by store
      }
    } else {
      if (!email() || !password() || !firstName() || !lastName()) {
        setLocalError("Please fill in all required fields");
        return;
      }
      if (password() !== confirmPassword()) {
        setLocalError("Passwords do not match");
        return;
      }
      if (password().length < 8) {
        setLocalError("Password must be at least 8 characters");
        return;
      }
      try {
        await authStore.register({
          email: email().trim(),
          password: password(),
          firstName: firstName().trim(),
          lastName: lastName().trim(),
        });
        resetForm();
      } catch {
        // Handled by store
      }
    }
  };

  return (
    <Show when={authStore.isAuthModalOpen()}>
      {/* Backdrop */}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
        onClick={(e) => {
          if (e.target === e.currentTarget) authStore.closeAuthModal();
        }}
      >
        {/* Modal Container */}
        <div
          role="dialog"
          aria-modal="true"
          class="relative w-full max-w-md bg-[var(--bg-page)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => authStore.closeAuthModal()}
            aria-label="Close dialog"
            class="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="p-6 sm:p-8">
            {/* Header / Brand */}
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--brand-600)] text-white font-black text-2xl shadow-md mb-3">
                E
              </div>
              <h2 class="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {authStore.authModalMode() === "login" ? "Welcome back" : "Create an account"}
              </h2>
              <p class="text-xs text-[var(--text-secondary)] mt-1">
                {authStore.authModalMode() === "login"
                  ? "Access your saved cart, orders, and wishlist"
                  : "Join AuraCommerce for seamless checkout & exclusive perks"}
              </p>
            </div>

            {/* Intercepted Reason Banner (if triggered by Add to Cart, Buy Now, or Wishlist) */}
            <Show when={authStore.authModalReason()}>
              <div class="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                <span class="text-base leading-none">🔒</span>
                <div>
                  <span class="font-semibold block">Authentication Required</span>
                  <span>{authStore.authModalReason()}</span>
                </div>
              </div>
            </Show>

            {/* Mode Switcher Tabs */}
            <div class="flex p-1 mb-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                class={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authStore.authModalMode() === "login"
                    ? "bg-[var(--bg-page)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode("register")}
                class={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authStore.authModalMode() === "register"
                    ? "bg-[var(--bg-page)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error alerts */}
            <Show when={localError() || authStore.errorMessage()}>
              <div class="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {localError() || authStore.errorMessage()}
              </div>
            </Show>

            {/* Form */}
            <form onSubmit={handleSubmit} class="space-y-4">
              {/* Register extra fields */}
              <Show when={authStore.authModalMode() === "register"}>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="auth-first-name" class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      First Name
                    </label>
                    <input
                      id="auth-first-name"
                      type="text"
                      required
                      value={firstName()}
                      onInput={(e) => setFirstName(e.currentTarget.value)}
                      class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                  <div>
                    <label for="auth-last-name" class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    <input
                      id="auth-last-name"
                      type="text"
                      required
                      value={lastName()}
                      onInput={(e) => setLastName(e.currentTarget.value)}
                      class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                </div>
              </Show>

              {/* Email / Username */}
              <div>
                <label for="auth-email" class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  Email or Username
                </label>
                <input
                  id="auth-email"
                  type="text"
                  required
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                />
              </div>

              {/* Password */}
              <div>
                <label for="auth-password" class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                />
              </div>

              {/* Confirm Password */}
              <Show when={authStore.authModalMode() === "register"}>
                <div>
                  <label for="auth-confirm-password" class="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm-password"
                    type="password"
                    required
                    value={confirmPassword()}
                    onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                    class="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                  />
                </div>
              </Show>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={authStore.isLoading()}
                class="w-full mt-2 py-3 px-4 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-[var(--text-on-brand)] font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Show when={authStore.isLoading()}>
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </Show>
                <span>
                  {authStore.authModalMode() === "login" ? "Sign In & Continue" : "Create Account & Continue"}
                </span>
              </button>
            </form>

            {/* Master Admin Testing Account */}
            <div class="mt-6 pt-5 border-t border-[var(--border)] text-center">
              <span class="block text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase mb-2">
                ⚙️ Development & Testing Account
              </span>
              <button
                type="button"
                onClick={fillMasterAccount}
                class="w-full py-2 px-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] transition-colors flex items-center justify-center gap-2"
              >
                <span>👑 Quick Fill Master Admin</span>
                <span class="text-[10px] text-[var(--text-secondary)] font-mono">(admin / admin)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
