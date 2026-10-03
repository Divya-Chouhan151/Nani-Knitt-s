import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { ProfileSidebar } from "./components/ProfileSidebar";

describe("ProfileSidebar", () => {
  it("renders profile navigation links with Home pointing to main site", () => {
    render(() => (
      <Router>
        <Route path="*" component={ProfileSidebar} />
      </Router>
    ));

    const homeLink = screen.getByRole("link", { name: /Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");

    const personalLink = screen.getByRole("link", { name: /Personal Details/i });
    expect(personalLink).toBeInTheDocument();
    expect(personalLink).toHaveAttribute("href", "/profile/personal");

    expect(screen.getByText("Addresses")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Payment Methods")).toBeInTheDocument();
    expect(screen.getByText("Login & Security")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Help Center")).toBeInTheDocument();
  });
});
