import { RefreshToken } from "./global";
import { Blog } from "./website";

export interface User {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  age?: number | null;
  dateOfBirth: string;
  info?: string | null;
  personalId: string;
  needPasswordChange: boolean;
  starredBlogs?: Blog[];
  // transactions?: Transaction[];
  // form100s?: Form100[];
  photo?: File | null;
  // chat?: Chat | null;
  phoneNumber: string;
  passwordHash: string;
  smsCode?: string | null;
  smsCodeExpiresAt?: string | null;
  isVerified: boolean;
  refreshTokens?: RefreshToken[];
  // visits?: Visit[];
  createdAt: string;
  updatedAt: string;
}

export interface PendingUser {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  age?: number | null;
  dateOfBirth: string;
  personalId: string;
  phoneNumber: string;
  passwordHash: string;
  smsCode?: string | null;
  smsCodeExpiresAt?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
