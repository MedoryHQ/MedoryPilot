import {
  Form100,
  Transaction,
  Visit,
  File,
  RefreshToken,
  BlogStar,
  Chat,
} from ".";

export interface User {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  age?: number | null;
  dateOfBirth: string;
  personalId: string;
  needPasswordChange: boolean;
  stars: BlogStar[];
  transactions: Transaction[];
  form100s: Form100[];
  photo?: File | null;
  chat?: Chat | null;
  phoneNumber?: string | null;
  passwordHash: string;
  smsCode?: string | null;
  smsCodeExpiresAt?: string | null;
  isVerified: boolean;
  refreshTokens: RefreshToken[];
  visits: Visit[];
  createdAt?: string;
  updatedAt?: string;
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
  phoneNumber?: string | null;
  passwordHash: string;
  smsCode?: string | null;
  smsCodeExpiresAt?: string | null;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}
