import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { LegalPage } from "./LegalPage";

describe("LegalPage", () => {
  it("renders Privacy Policy document correctly", () => {
    render(() => (
      <Router>
        <Route path="*" component={() => <LegalPage initialDocument="privacy" />} />
      </Router>
    ));

    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/We honor your privacy like a treasured family heirloom/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /1\. Information We Collect/i })).toBeInTheDocument();
  });

  it("renders Terms of Service document correctly", () => {
    render(() => (
      <Router>
        <Route path="*" component={() => <LegalPage initialDocument="terms" />} />
      </Router>
    ));

    expect(screen.getByRole("heading", { level: 1, name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /2\. Description of Products & Handmade Nature/i })).toBeInTheDocument();
  });

  it("renders Shipping & Returns document with internal checklist", () => {
    render(() => (
      <Router>
        <Route path="*" component={() => <LegalPage initialDocument="shipping-returns" />} />
      </Router>
    ));

    expect(screen.getByRole("heading", { level: 1, name: "Shipping & Returns Policy" })).toBeInTheDocument();
    expect(screen.getByText(/Internal Review Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm default return window/i)).toBeInTheDocument();
  });
});
