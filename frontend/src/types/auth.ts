export type UserRole =
  | "ROLE_CUSTOMER"
  | "ROLE_MERCHANDISER"
  | "ROLE_SUPPORT"
  | "ROLE_ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  status: "ACTIVE" | "SUSPENDED" | "LOCKED";
  emailVerified?: boolean;
  phoneNumber?: string;
  optionalPhoneNumber?: string;
  phoneVerified?: boolean;
  dob?: string;
  gender?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface PendingAction {
  id: string;
  description: string;
  execute: () => void;
}
