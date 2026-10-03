import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { NaniKnittingLogo } from "./NaniKnittingLogo";

describe("NaniKnittingLogo", () => {
  it("renders animated Nani knitting figure and wordmark", () => {
    render(() => <NaniKnittingLogo />);

    expect(screen.getByText("Nani's Knitts")).toBeInTheDocument();
    expect(screen.getByText("handmade & heartfelt")).toBeInTheDocument();

    const logoContainer = screen.getByLabelText("Nani's Knitts — Handmade & Heartfelt");
    expect(logoContainer).toBeInTheDocument();

    const svgEl = logoContainer.querySelector("svg");
    expect(svgEl).toBeInTheDocument();
    expect(svgEl?.querySelector(".anim-needle-left")).toBeInTheDocument();
    expect(svgEl?.querySelector(".anim-needle-right")).toBeInTheDocument();
    expect(svgEl?.querySelector(".anim-yarn-ball")).toBeInTheDocument();
  });

  it("renders plain wordmark typography without gradient or highlight effects", () => {
    render(() => <NaniKnittingLogo />);
    const wordmark = screen.getByText("Nani's Knitts");
    expect(wordmark).toBeInTheDocument();
    expect(wordmark.className).toContain("text-[var(--text-primary)]");
    expect(wordmark.className).not.toContain("bg-gradient-to-r");
    expect(wordmark.className).not.toContain("text-transparent");
    expect(wordmark.className).not.toContain("drop-shadow");
  });

  it("applies highlight aura and hover micro-interaction to the character icon mark", () => {
    const { container } = render(() => <NaniKnittingLogo size="lg" />);
    const iconContainer = container.querySelector(".rounded-2xl");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.className).toContain("ring-2");
    expect(iconContainer?.className).toContain("shadow-[0_0_20px_rgba(244,63,94,0.3)]");
    expect(iconContainer?.className).toContain("group-hover:scale-110");

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("h-14");
  });
});
