import { JSX } from "solid-js";

export interface BadgeProps {
  variant?: "brand" | "success" | "warning" | "danger" | "neutral";
  class?: string;
  children: JSX.Element;
}

export function Badge(props: BadgeProps) {
  const variantClass = () => {
    switch (props.variant || "brand") {
      case "success":
        return "bg-[var(--success)] text-[var(--success-text)]";
      case "warning":
        return "bg-[var(--warning)] text-[var(--warning-text)]";
      case "danger":
        return "bg-[var(--danger)] text-[var(--danger-text)]";
      case "neutral":
        return "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]";
      case "brand":
      default:
        return "bg-[var(--brand-100)] text-[var(--text-primary)]";
    }
  };

  return (
    <span
      class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variantClass()} ${props.class || ""}`}
    >
      {props.children}
    </span>
  );
}
