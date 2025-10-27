import {
  MessageSender,
  MessageStatus,
  Form100,
  Transaction,
  Visit,
  File,
  RefreshToken,
} from ".";
import { BlogStar } from "./website";

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

export interface Chat {
  id: string;
  user: User;
  userId: string;
  unreadCount: number;
  lastMessage?: string | null;
  lastAt?: string | null;
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  chat: Chat;
  chatId: string;
  sender: MessageSender;
  body?: string | null;
  file?: File | null;
  status: MessageStatus;
  createdAt?: string;
  updatedAt?: string;
}
