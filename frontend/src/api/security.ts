import { SecurityEvent, Session, TwoFactorSetup } from "../types/profile";

const SECURITY_API_URL =
  typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
    ? (import.meta.env.VITE_PROFILE_API_URL ? `${import.meta.env.VITE_PROFILE_API_URL}/security` : `${window.location.origin}/api/v1/profile/security`)
    : (import.meta.env.VITE_PROFILE_API_URL ? `${import.meta.env.VITE_PROFILE_API_URL}/security` : "http://localhost:8081/api/v1/profile/security");

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function changePasswordApi(
  payload: { currentPassword: string; newPassword: string; confirmPassword: string },
  token?: string | null
): Promise<{ message: string }> {
  const res = await fetch(`${SECURITY_API_URL}/password`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update password");
  }
  return await res.json();
}

export async function fetchActiveSessionsApi(token?: string | null): Promise<Session[]> {
  const res = await fetch(`${SECURITY_API_URL}/sessions`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return await res.json();
}

export async function revokeSessionApi(sessionId: string, token?: string | null): Promise<void> {
  const res = await fetch(`${SECURITY_API_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to revoke session");
}

export async function initiate2FaSetupApi(token?: string | null): Promise<TwoFactorSetup> {
  const res = await fetch(`${SECURITY_API_URL}/2fa/setup`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to initiate 2FA setup");
  return await res.json();
}

export async function confirm2FaApi(code: string, token?: string | null): Promise<{ message: string }> {
  const res = await fetch(`${SECURITY_API_URL}/2fa/confirm`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Invalid 2FA code");
  }
  return await res.json();
}

export async function disable2FaApi(password: string, token?: string | null): Promise<{ message: string }> {
  const res = await fetch(`${SECURITY_API_URL}/2fa/disable`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to disable 2FA");
  }
  return await res.json();
}

export async function fetchSecurityLogsApi(token?: string | null): Promise<SecurityEvent[]> {
  const res = await fetch(`${SECURITY_API_URL}/logs`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch security logs");
  return await res.json();
}
