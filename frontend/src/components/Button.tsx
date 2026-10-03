import { JSX } from "solid-js";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button(props: ButtonProps) {
  const variantClass = () => {
    switch (props.variant || "primary") {
      case "secondary":
        return "bg-[var(--brand-100)] text-[var(--text-primary)] hover:opacity-90";
      case "outline":
        return "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]";
      case "ghost":
        return "text-[var(--brand-600)] hover:bg-[var(--brand-100)]/30";
      case "primary":
      default:
        return "bg-[var(--brand-600)] text-[var(--text-on-brand)] hover:bg-[var(--brand-700)] shadow-sm";
    }
  };

  const sizeClass = () => {
    switch (props.size || "md") {
      case "sm":
        return "px-3 py-1.5 text-xs rounded-lg";
      case "lg":
        return "px-6 py-3 text-base rounded-xl font-semibold";
      case "md":
      default:
        return "px-4 py-2 text-sm rounded-xl font-medium";
    }
  };

  return (
    <button
      {...props}
      class={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] disabled:opacity-50 disabled:cursor-not-allowed ${variantClass()} ${sizeClass()} ${props.class || ""}`}
    >
      {props.children}
    </button>
  );
}
