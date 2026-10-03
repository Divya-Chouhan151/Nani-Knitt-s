import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { WishlistHeartIcon } from "./WishlistHeartIcon";

describe("WishlistHeartIcon", () => {
  it("renders plain outline state when isWishlisted is false", () => {
    const { container } = render(() => <WishlistHeartIcon isWishlisted={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains("fill-none")).toBe(true);
    expect(svg?.classList.contains("scale-100")).toBe(true);
    expect(svg?.classList.contains("fill-rose-500")).toBe(false);
  });

  it("renders solid filled state with pop transition when isWishlisted is true", () => {
    const { container } = render(() => <WishlistHeartIcon isWishlisted={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains("fill-rose-500")).toBe(true);
    expect(svg?.classList.contains("stroke-rose-500")).toBe(true);
    expect(svg?.classList.contains("scale-110")).toBe(true);
  });
});
