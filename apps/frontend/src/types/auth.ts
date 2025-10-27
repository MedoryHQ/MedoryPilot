export type AuthMethod = "phone" | "email" | "social";

export interface User {
  id: string;
  email?: string | null;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  smsCodeExpiresAt?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
}
