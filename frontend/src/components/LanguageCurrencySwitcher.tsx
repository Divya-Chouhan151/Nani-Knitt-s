import { For } from "solid-js";
import {
  localeStore,
  LANGUAGES,
  CURRENCIES,
  SupportedLanguage,
  SupportedCurrency,
} from "../stores/localeStore";

export interface LanguageCurrencySwitcherProps {
  variant?: "header" | "footer";
}

export function LanguageCurrencySwitcher(props: LanguageCurrencySwitcherProps) {
  const isHeader = () => props.variant !== "footer";

  return (
    <div class="flex items-center gap-2">
      {/* Currency Switcher */}
      <div class="relative">
        <select
          aria-label="Select Currency"
          value={localeStore.currency()}
          onChange={(e) => localeStore.setCurrency(e.currentTarget.value as SupportedCurrency)}
          class={`rounded-xl border font-bold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all ${
            isHeader()
              ? "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-primary)] py-1.5 px-2.5 hover:border-[var(--brand-500)]"
              : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-primary)] py-2 px-3 hover:border-[var(--brand-500)]"
          }`}
        >
          <For each={Object.values(CURRENCIES)}>
            {(curr) => (
              <option value={curr.code}>
                {curr.name}
              </option>
            )}
          </For>
        </select>
      </div>

      {/* Language Switcher */}
      <div class="relative">
        <select
          aria-label="Select Language"
          value={localeStore.language()}
          onChange={(e) => localeStore.setLanguage(e.currentTarget.value as SupportedLanguage)}
          class={`rounded-xl border font-bold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all ${
            isHeader()
              ? "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-primary)] py-1.5 px-2.5 hover:border-[var(--brand-500)]"
              : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-primary)] py-2 px-3 hover:border-[var(--brand-500)]"
          }`}
        >
          <For each={Object.values(LANGUAGES)}>
            {(lang) => (
              <option value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            )}
          </For>
        </select>
      </div>
    </div>
  );
}
