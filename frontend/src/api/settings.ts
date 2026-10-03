import { UserSettings } from "../types/profile";

const SETTINGS_API_URL = import.meta.env.VITE_PROFILE_API_URL
  ? `${import.meta.env.VITE_PROFILE_API_URL}/settings`
  : "http://localhost:8081/api/v1/profile/settings";

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchSettingsApi(token?: string | null): Promise<UserSettings> {
  const res = await fetch(`${SETTINGS_API_URL}`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load settings");
  return await res.json();
}

export async function updateSettingsApi(settings: Partial<UserSettings>, token?: string | null): Promise<UserSettings> {
  const res = await fetch(`${SETTINGS_API_URL}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return await res.json();
}

export async function requestAccountDeletionApi(
  payload: { password: string; confirmation: string },
  token?: string | null
): Promise<{ message: string }> {
  const res = await fetch(`${SETTINGS_API_URL}/deactivate`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to schedule account deletion");
  }
  return await res.json();
}

export async function cancelAccountDeletionApi(token?: string | null): Promise<{ message: string }> {
  const res = await fetch(`${SETTINGS_API_URL}/reactivate`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to cancel account deletion");
  return await res.json();
}
