import { Component } from "solid-js";

interface WishlistHeartIconProps {
  isWishlisted: boolean;
  class?: string;
}

export const WishlistHeartIcon: Component<WishlistHeartIconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class={`transition-all duration-200 ease-out transform active:scale-125 ${
        props.isWishlisted
          ? "fill-rose-500 stroke-rose-500 text-rose-500 scale-110 drop-shadow-[0_2px_8px_rgba(244,63,94,0.45)]"
          : "fill-none stroke-current text-[var(--text-secondary)] hover:text-rose-500 scale-100 hover:scale-105"
      } ${props.class || "w-4 h-4"}`}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};
