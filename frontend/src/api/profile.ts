import { User } from "../types/auth";

const PROFILE_API_URL = import.meta.env.VITE_PROFILE_API_URL || "http://localhost:8081/api/v1/profile";

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function updateProfileApi(
  payload: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    optionalPhoneNumber?: string;
    dob?: string;
    gender?: string;
  },
  token?: string | null
): Promise<User> {
  const res = await fetch(`${PROFILE_API_URL}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update profile");
  }
  return await res.json();
}

export async function uploadAvatarApi(file: File, token?: string | null): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${PROFILE_API_URL}/avatar`, {
    method: "POST",
    headers,
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload avatar");
  }
  return await res.json();
}

export async function initiateEmailChangeApi(newEmail: string, token?: string | null): Promise<{ message: string }> {
  const res = await fetch(`${PROFILE_API_URL}/email/initiate`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ newEmail }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to initiate email change");
  }
  return await res.json();
}

export async function confirmEmailChangeApi(tokenCode: string): Promise<User> {
  const res = await fetch(`${PROFILE_API_URL}/email/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token: tokenCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Invalid or expired verification link");
  }
  return await res.json();
}

export async function initiatePhoneChangeApi(newPhone: string, token?: string | null): Promise<{ message: string }> {
  const res = await fetch(`${PROFILE_API_URL}/phone/initiate`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ newPhone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to initiate phone verification");
  }
  return await res.json();
}

export async function confirmPhoneChangeApi(code: string, token?: string | null): Promise<User> {
  const res = await fetch(`${PROFILE_API_URL}/phone/confirm`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Invalid or expired OTP code");
  }
  return await res.json();
}
