import { User } from "./user";

export type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  order?: number;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseError {
  response: {
    data: {
      error: {
        ka: string;
        en: string;
      };
    };
  };
}

export interface GlobalErrorResponse {
  error: ErrorResponse;
  errors?: ErrorsResponse[];
}

export interface ErrorResponse {
  en: string;
  ka: string;
}

export interface ErrorsResponse {
  location: string;
  msg: string;
  path: string;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type Stage =
  | "register"
  | "login"
  | "verify-otp"
  | "forgot-password"
  | "forgot-password-otp"
  | "new-password";

export interface RefreshToken {
  id: string;
  user: User;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
