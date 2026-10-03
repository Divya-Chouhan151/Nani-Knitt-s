import { JSX, Show } from "solid-js";
import { Header } from "../../../components/Header";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { authStore } from "../../auth/stores/authStore";

export function ProfileLayout(props: { children?: JSX.Element }) {
  return (
    <div class="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col transition-colors duration-200">
      <Header />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-5">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                if (typeof window !== "undefined") window.location.href = "/";
              }
            }}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-500)]/50 transition-all cursor-pointer group shadow-2xs"
            aria-label="Go back to previous page"
          >
            <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        <Show
          when={authStore.isAuthenticated()}
          fallback={
            <div class="max-w-md mx-auto my-12 p-8 bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl text-center shadow-lg animate-in fade-in zoom-in-95">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--brand-100)] dark:bg-[var(--brand-900)] text-[var(--brand-600)] flex items-center justify-center text-2xl">
                🔒
              </div>
              <h2 class="text-xl font-bold tracking-tight mb-2">Sign In Required</h2>
              <p class="text-xs text-[var(--text-secondary)] mb-6">
                Please log in or create an account to access your profile, order tracking, address book, and security settings.
              </p>
              <button
                type="button"
                onClick={() => authStore.openAuthModal("login", "Sign in to access your User Profile")}
                class="w-full py-3 px-4 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-bold text-xs shadow-md transition-all"
              >
                Sign In to Your Account
              </button>
            </div>
          }
        >
          <div class="flex flex-col lg:flex-row gap-8">
            <ProfileSidebar />

            <section class="flex-1 min-w-0 bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
              {props.children}
            </section>
          </div>
        </Show>
      </main>
    </div>
  );
}
