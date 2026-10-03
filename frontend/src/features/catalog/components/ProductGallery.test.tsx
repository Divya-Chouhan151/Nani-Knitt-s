import { render, screen, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import { ProductGallery } from "./ProductGallery";

describe("ProductGallery", () => {
  const sampleImages = [
    { id: "img-1", url: "https://example.com/front.jpg", altText: "Front angle", isPrimary: true, sortOrder: 0 },
    { id: "img-2", url: "https://example.com/side.jpg", altText: "Side profile", isPrimary: false, sortOrder: 1 },
    { id: "img-3", url: "https://example.com/detail.jpg", altText: "Detail switches", isPrimary: false, sortOrder: 2 },
  ];

  it("renders the primary image initially", () => {
    render(() => <ProductGallery images={sampleImages} title="Mechanical Keyboard" />);

    const mainImg = screen.getByTestId("main-product-image");
    expect(mainImg).toBeInTheDocument();
    expect(mainImg).toHaveAttribute("src", "https://example.com/front.jpg");
    expect(mainImg).toHaveAttribute("alt", "Front angle");
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("switches main image when a thumbnail angle is clicked", async () => {
    render(() => <ProductGallery images={sampleImages} title="Mechanical Keyboard" />);

    const sideThumbBtn = screen.getByRole("button", { name: /select image angle 2/i });
    fireEvent.click(sideThumbBtn);

    const updatedMainImg = screen.getByTestId("main-product-image");
    expect(updatedMainImg).toBeInTheDocument();
    expect(updatedMainImg).toHaveAttribute("src", "https://example.com/side.jpg");
    expect(updatedMainImg).toHaveAttribute("alt", "Side profile");
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });
});
