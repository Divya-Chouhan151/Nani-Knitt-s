import { Component, createSignal, createMemo, For, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LEGAL_DOCUMENTS, LegalDocument } from "../../content/legalContent";

interface LegalPageProps {
  initialDocument?: string;
}

export const LegalPage: Component<LegalPageProps> = (props) => {
  let location = { pathname: "/privacy" };
  let navigate = (to: string) => {
    if (typeof window !== "undefined") window.location.href = to;
  };

  try {
    location = useLocation();
    navigate = useNavigate();
  } catch {
    // Router context not available (e.g. standalone test)
  }

  const [searchQuery, setSearchQuery] = createSignal("");
  const [activeSectionId, setActiveSectionId] = createSignal<string>("");

  // Determine current document from prop or pathname
  const currentDocKey = createMemo(() => {
    if (props.initialDocument) return props.initialDocument;
    const path = location.pathname.toLowerCase();
    if (path.includes("terms")) return "terms";
    if (path.includes("shipping")) return "shipping-returns";
    return "privacy";
  });

  const doc = createMemo<LegalDocument>(() => {
    return LEGAL_DOCUMENTS[currentDocKey()] || LEGAL_DOCUMENTS.privacy;
  });

  const switchDoc = (key: string) => {
    navigate(`/${key}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div class="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col transition-colors">
      <Header
        searchQuery={searchQuery()}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            navigate(`/?q=${encodeURIComponent(q)}`);
          }
        }}
      />

      {/* Main Container */}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Arrow & Breadcrumb Navigation */}
        <div class="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                navigate("/");
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

          <nav class="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <a href="/" class="hover:text-[var(--brand-600)] transition-colors">Home</a>
            <span>/</span>
            <span class="text-[var(--text-primary)] font-medium">Legal &amp; Policies</span>
            <span>/</span>
            <span class="text-[var(--brand-600)] font-semibold">{doc().title}</span>
          </nav>
        </div>

        {/* Top Header Banner */}
        <div class="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm mb-8 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-100)]/40 text-[var(--brand-600)] text-xs font-bold mb-2">
                <span>📜 Official Customer Agreement</span>
                <span>•</span>
                <span>v{doc().version}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {doc().title}
              </h1>
              <p class="text-sm text-[var(--text-secondary)] mt-1">
                {doc().subtitle}
              </p>
            </div>

            <div class="text-xs text-[var(--text-secondary)] bg-[var(--bg-page)] px-4 py-2.5 rounded-2xl border border-[var(--border)] self-start sm:self-auto space-y-0.5">
              <span class="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Effective Date</span>
              <span class="font-bold text-[var(--text-primary)]">{doc().lastUpdated}</span>
            </div>
          </div>

          {/* Document Summary Box */}
          <div class="p-4 rounded-2xl bg-[var(--bg-page)]/80 border border-[var(--border)] text-xs text-[var(--text-primary)] leading-relaxed">
            <span class="font-bold text-[var(--brand-600)] mr-1">Summary:</span>
            {doc().summary}
          </div>

          {/* Document Switcher Tabs (Mobile + Desktop quick switch) */}
          <div class="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]/70">
            <button
              type="button"
              onClick={() => switchDoc("privacy")}
              class={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentDocKey() === "privacy"
                  ? "bg-[var(--brand-600)] text-white shadow-sm"
                  : "bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              🔒 Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => switchDoc("terms")}
              class={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentDocKey() === "terms"
                  ? "bg-[var(--brand-600)] text-white shadow-sm"
                  : "bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              ⚖️ Terms of Service
            </button>
            <button
              type="button"
              onClick={() => switchDoc("shipping-returns")}
              class={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentDocKey() === "shipping-returns"
                  ? "bg-[var(--brand-600)] text-white shadow-sm"
                  : "bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              📦 Shipping &amp; Returns
            </button>
          </div>
        </div>

        {/* Two-Column Layout: Sticky Sidebar TOC + Content */}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Table of Contents */}
          <aside class="hidden lg:block lg:col-span-1 space-y-6 sticky top-24 self-start">
            <div class="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm space-y-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                On This Page
              </h3>
              <ul class="space-y-1.5 text-xs">
                <For each={doc().sections}>
                  {(sec) => (
                    <li>
                      <button
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        class={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all ${
                          activeSectionId() === sec.id
                            ? "bg-[var(--brand-100)]/40 font-bold text-[var(--brand-600)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]"
                        }`}
                      >
                        {sec.title}
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </div>

            {/* Quick Contact Card */}
            <div class="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm space-y-3 text-xs">
              <h3 class="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span>💬</span> Have Questions?
              </h3>
              <p class="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                Our dedicated artisan care desk is here to clarify any aspect of our customer agreements.
              </p>
              <a
                href="/profile/help"
                class="inline-block w-full py-2 text-center rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-[var(--brand-600)] font-bold hover:border-[var(--brand-500)] transition-all"
              >
                Visit Help Center →
              </a>
            </div>
          </aside>

          {/* Right Main Legal Articles */}
          <div class="lg:col-span-3 space-y-8">
            {/* Team Verification Callout (Transparency / Review flag) */}
            <Show when={doc().notesForTeam && doc().notesForTeam.length > 0}>
              <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div class="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <span>⚠️</span>
                  <span>Internal Review Checklist (Confirm before Launch)</span>
                </div>
                <ul class="list-disc list-inside space-y-1 text-[11px] opacity-90 pl-1">
                  <For each={doc().notesForTeam}>
                    {(note) => <li>{note}</li>}
                  </For>
                </ul>
              </div>
            </Show>

            {/* Section Blocks */}
            <div class="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm space-y-10">
              <For each={doc().sections}>
                {(sec) => (
                  <section id={sec.id} class="space-y-4 pt-2 border-b border-[var(--border)]/60 last:border-b-0 pb-8 last:pb-0">
                    <h2 class="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                      {sec.title}
                    </h2>

                    <For each={sec.content}>
                      {(p) => (
                        <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {p}
                        </p>
                      )}
                    </For>

                    <Show when={sec.items && sec.items.length > 0}>
                      <ul class="space-y-2 pl-4 list-disc list-outside text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                        <For each={sec.items}>
                          {(item) => {
                            const parts = item.split(":");
                            if (parts.length > 1) {
                              return (
                                <li>
                                  <strong class="text-[var(--text-primary)] font-semibold">{parts[0]}:</strong>
                                  <span>{parts.slice(1).join(":")}</span>
                                </li>
                              );
                            }
                            return <li>{item}</li>;
                          }}
                        </For>
                      </ul>
                    </Show>

                    <Show when={sec.alert}>
                      <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200">
                        <span class="font-bold mr-1">📌 Note:</span>
                        {sec.alert!.text}
                      </div>
                    </Show>
                  </section>
                )}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
