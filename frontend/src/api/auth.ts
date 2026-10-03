import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081/api/v1/auth";

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // for HttpOnly refresh cookie
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      return (await res.json()) as AuthResponse;
    }

    const err = await res.json().catch(() => ({ message: "Invalid credentials" }));
    throw new Error(err.message || "Invalid email or password");
  } catch (err: any) {
    if (err.name === "TypeError" || err.message === "Failed to fetch") {
      throw new Error("Cannot connect to backend auth-service at " + AUTH_API_URL);
    }
    throw err;
  }
}

export async function registerApi(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    const res = await fetch(`${AUTH_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (res.ok) {
      return (await res.json()) as AuthResponse;
    }

    const err = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err.message || "Registration failed");
  } catch (err: any) {
    if (err.name === "TypeError" || err.message === "Failed to fetch") {
      throw new Error("Cannot connect to backend auth-service at " + AUTH_API_URL);
    }
    throw err;
  }
}

export async function refreshApi(): Promise<{ accessToken: string }> {
  const res = await fetch(`${AUTH_API_URL}/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to refresh token" }));
    throw new Error(err.message || "Failed to refresh token");
  }

  return await res.json();
}

export async function logoutApi(accessToken?: string): Promise<void> {
  try {
    await fetch(`${AUTH_API_URL}/logout`, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: "include",
    });
  } catch {
    // Ignore network error on logout
  }
}

export async function getMeApi(accessToken: string): Promise<User> {
  const res = await fetch(`${AUTH_API_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await res.json();
}
