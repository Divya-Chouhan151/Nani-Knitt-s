/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        surface: "var(--bg-surface)",
        section: {
          a: "var(--bg-section-a)",
          b: "var(--bg-section-b)",
          info: "var(--bg-info)",
        },
        brand: {
          100: "var(--brand-100)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        "on-brand": "var(--text-on-brand)",
        border: "var(--border)",
        semantic: {
          success: "var(--success)",
          "success-text": "var(--success-text)",
          warning: "var(--warning)",
          "warning-text": "var(--warning-text)",
          danger: "var(--danger)",
          "danger-text": "var(--danger-text)",
          "info-text": "var(--info-text)",
        },
      },
    },
  },
  plugins: [],
};
