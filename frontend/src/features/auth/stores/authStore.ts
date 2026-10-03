import { createSignal, createRoot } from "solid-js";
import { User, LoginCredentials, RegisterCredentials, PendingAction } from "../../../types/auth";
import { loginApi, registerApi, logoutApi, refreshApi } from "../../../api/auth";

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Buffer of 30 seconds before actual expiration
    return Date.now() >= payload.exp * 1000 - 30000;
  } catch {
    return true;
  }
}

function createAuthStoreInstance() {
  const getStoredUser = (): User | null => {
    try {
      if (typeof localStorage === "undefined") return null;
      const u = localStorage.getItem("nani_auth_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const getStoredToken = (): string | null => {
    try {
      if (typeof localStorage === "undefined") return null;
      return localStorage.getItem("nani_auth_token");
    } catch {
      return null;
    }
  };

  const [user, setUser] = createSignal<User | null>(getStoredUser());
  const [accessToken, setAccessToken] = createSignal<string | null>(getStoredToken());
  const [isAuthModalOpen, setIsAuthModalOpen] = createSignal(false);
  const [authModalMode, setAuthModalMode] = createSignal<"login" | "register">("login");
  const [authModalReason, setAuthModalReason] = createSignal<string | null>(null);
  const [pendingAction, setPendingAction] = createSignal<PendingAction | null>(null);
  const [toastMessage, setToastMessage] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const isAuthenticated = () => !!user();

  const refreshToken = async (): Promise<string | null> => {
    try {
      const res = await refreshApi();
      if (res && res.accessToken) {
        setAccessToken(res.accessToken);
        try {
          localStorage.setItem("nani_auth_token", res.accessToken);
        } catch {
          // ignore
        }
        return res.accessToken;
      }
      return null;
    } catch (err) {
      console.warn("Token refresh failed; clearing stale user session", err);
      setUser(null);
      setAccessToken(null);
      try {
        localStorage.removeItem("nani_auth_user");
        localStorage.removeItem("nani_auth_token");
      } catch {
        // ignore
      }
      return null;
    }
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    const current = accessToken();
    if (!current) return null;
    if (!isTokenExpired(current)) {
      return current;
    }
    return await refreshToken();
  };

  let toastTimer: any = null;
  const showToast = (message: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(message);
    toastTimer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const openAuthModal = (mode: "login" | "register" = "login", reason?: string) => {
    setAuthModalMode(mode);
    setAuthModalReason(reason || null);
    setErrorMessage(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    setErrorMessage(null);
    // Note: Do not immediately clear pending action if user accidentally clicked close,
    // but if user cancels, it will be superseded on next action.
  };

  /**
   * Action Interceptor:
   * If authenticated -> executes immediately and returns true.
   * If unauthenticated -> saves pending action, opens auth modal, and returns false.
   */
  const requireAuth = (action: () => void, description = "Please sign in to proceed"): boolean => {
    if (isAuthenticated()) {
      action();
      return true;
    }

    setPendingAction({
      id: Math.random().toString(36).substring(2, 9),
      description,
      execute: action,
    });
    openAuthModal("login", description);
    return false;
  };

  const executePendingAction = () => {
    const action = pendingAction();
    if (action) {
      setPendingAction(null);
      try {
        action.execute();
        showToast(`Action completed: ${action.description}`);
      } catch (err) {
        console.error("Failed to execute pending action post-auth", err);
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginApi(credentials);
      setUser(res.user);
      setAccessToken(res.accessToken);
      try {
        localStorage.setItem("nani_auth_user", JSON.stringify(res.user));
        localStorage.setItem("nani_auth_token", res.accessToken);
      } catch {
        // ignore
      }
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${res.user.firstName}!`);
      executePendingAction();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please check your credentials.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await registerApi(credentials);
      setUser(res.user);
      setAccessToken(res.accessToken);
      try {
        localStorage.setItem("nani_auth_user", JSON.stringify(res.user));
        localStorage.setItem("nani_auth_token", res.accessToken);
      } catch {
        // ignore
      }
      setIsAuthModalOpen(false);
      showToast(`Welcome to AuraCommerce, ${res.user.firstName}!`);
      executePendingAction();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = accessToken();
    setUser(null);
    setAccessToken(null);
    try {
      localStorage.removeItem("nani_auth_user");
      localStorage.removeItem("nani_auth_token");
    } catch {
      // ignore
    }
    setPendingAction(null);
    showToast("You have been signed out.");
    try {
      if (token) {
        await logoutApi(token);
      }
    } catch {
      // Ignore network errors
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isAuthModalOpen,
    authModalMode,
    authModalReason,
    pendingAction,
    toastMessage,
    isLoading,
    errorMessage,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
    requireAuth,
    login,
    register,
    logout,
    showToast,
    refreshToken,
    getValidAccessToken,
    isTokenExpired,
  };
}

// Export singleton store wrapped in Solid root for fine-grained reactivity across components
export const authStore = createRoot(createAuthStoreInstance);
