import { describe, it, expect, beforeEach, vi } from "vitest";
import { authStore } from "./authStore";
import * as authApi from "../../../api/auth";

describe("authStore", () => {
  beforeEach(async () => {
    vi.spyOn(authApi, "logoutApi").mockResolvedValue(undefined);
    vi.spyOn(authApi, "loginApi").mockImplementation(async (creds) => {
      if (creds.email === "admin" && creds.password === "admin") {
        return {
          user: {
            id: "1",
            firstName: "Admin",
            lastName: "User",
            email: "admin",
            roles: ["ROLE_ADMIN"],
          },
          accessToken: "mock-admin-token",
        };
      }
      throw new Error("Invalid email or password");
    });
    await authStore.logout();
    authStore.closeAuthModal();
  });

  it("initializes with unauthenticated guest state", () => {
    expect(authStore.isAuthenticated()).toBe(false);
    expect(authStore.user()).toBeNull();
    expect(authStore.accessToken()).toBeNull();
    expect(authStore.isAuthModalOpen()).toBe(false);
  });

  it("intercepts unauthenticated action via requireAuth and queues it", () => {
    const actionSpy = vi.fn();
    const result = authStore.requireAuth(actionSpy, "Sign in to add to cart");

    expect(result).toBe(false);
    expect(actionSpy).not.toHaveBeenCalled();
    expect(authStore.isAuthModalOpen()).toBe(true);
    expect(authStore.authModalReason()).toBe("Sign in to add to cart");
    expect(authStore.pendingAction()).not.toBeNull();
    expect(authStore.pendingAction()?.description).toBe("Sign in to add to cart");
  });

  it("executes pending action automatically upon successful login", async () => {
    const actionSpy = vi.fn();
    authStore.requireAuth(actionSpy, "Sign in to checkout");

    await authStore.login({
      email: "admin",
      password: "admin",
    });

    expect(authStore.isAuthenticated()).toBe(true);
    expect(authStore.user()?.email).toBe("admin");
    expect(authStore.user()?.roles).toContain("ROLE_ADMIN");
    expect(authStore.isAuthModalOpen()).toBe(false);
    expect(actionSpy).toHaveBeenCalledTimes(1);
    expect(authStore.pendingAction()).toBeNull();
  });

  it("executes immediately without interception when already authenticated", async () => {
    await authStore.login({
      email: "admin",
      password: "admin",
    });

    const actionSpy = vi.fn();
    const result = authStore.requireAuth(actionSpy, "Access admin console");

    expect(result).toBe(true);
    expect(actionSpy).toHaveBeenCalledTimes(1);
    expect(authStore.isAuthModalOpen()).toBe(false);
  });

  it("clears session on logout", async () => {
    await authStore.login({
      email: "admin",
      password: "admin",
    });
    expect(authStore.isAuthenticated()).toBe(true);

    await authStore.logout();
    expect(authStore.isAuthenticated()).toBe(false);
    expect(authStore.user()).toBeNull();
    expect(authStore.accessToken()).toBeNull();
  });

  it("rejects unknown or invalid login credentials", async () => {
    await expect(
      authStore.login({
        email: "random_unknown_user@example.com",
        password: "WrongPassword!",
      })
    ).rejects.toThrow("Invalid email or password");
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it("detects expired tokens and refreshes them via getValidAccessToken", async () => {
    // Construct expired and valid mock JWTs
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const expiredToken = `header.${btoa(JSON.stringify({ exp: pastExp }))}.sig`;
    const validToken = `header.${btoa(JSON.stringify({ exp: futureExp }))}.sig`;

    expect(authStore.isTokenExpired(expiredToken)).toBe(true);
    expect(authStore.isTokenExpired(validToken)).toBe(false);

    // Mock refreshApi
    const refreshSpy = vi.spyOn(authApi, "refreshApi").mockResolvedValue({
      accessToken: validToken,
    });

    // Mock loginApi to return expired token
    vi.spyOn(authApi, "loginApi").mockResolvedValue({
      user: {
        id: "1",
        firstName: "Admin",
        lastName: "User",
        email: "admin",
        roles: ["ROLE_ADMIN"],
      },
      accessToken: expiredToken,
    });

    await authStore.login({ email: "admin", password: "admin" });
    expect(authStore.accessToken()).toBe(expiredToken);

    const resultToken = await authStore.getValidAccessToken();
    expect(refreshSpy).toHaveBeenCalled();
    expect(resultToken).toBe(validToken);
  });
});
