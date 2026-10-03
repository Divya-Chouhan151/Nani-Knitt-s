import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { describe, it, expect, beforeEach } from "vitest";
import { AuthModal } from "./AuthModal";
import { authStore } from "../stores/authStore";

import * as authApi from "../../../api/auth";

describe("AuthModal", () => {
  beforeEach(async () => {
    vi.spyOn(authApi, "logoutApi").mockResolvedValue(undefined);
    await authStore.logout();
    authStore.closeAuthModal();
  });

  it("does not render when modal is closed", () => {
    render(() => <AuthModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when modal is opened", () => {
    authStore.openAuthModal("login", "Please sign in to add this item to your cart");
    render(() => <AuthModal />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText("Please sign in to add this item to your cart")).toBeInTheDocument();
  });

  it("switches to registration mode", () => {
    authStore.openAuthModal("login");
    render(() => <AuthModal />);

    const registerTab = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(registerTab);

    expect(screen.getByText(/first name/i)).toBeInTheDocument();
    expect(screen.getByText(/last name/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm password/i)).toBeInTheDocument();
  });

  it("populates master admin account when clicking quick fill button", async () => {
    authStore.openAuthModal("login");
    render(() => <AuthModal />);

    const adminBtn = screen.getByRole("button", { name: /quick fill master admin/i });
    fireEvent.click(adminBtn);

    const emailInput = screen.getByLabelText(/email or username/i) as HTMLInputElement;
    expect(emailInput.value).toBe("admin");
  });

  it("closes modal on close button click", () => {
    authStore.openAuthModal("login");
    render(() => <AuthModal />);

    const closeBtn = screen.getByLabelText(/close dialog/i);
    fireEvent.click(closeBtn);

    expect(authStore.isAuthModalOpen()).toBe(false);
  });
});
