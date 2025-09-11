export interface Language {
  id: string;
  name: string;
  code: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableOption {
  value: string;
  text: string;
}

export interface File {
  id: string;
  name: string;
  status?: string;
  path: string;
  size: number;
  index?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  key?: string;
  children?: MenuItem[];
}

export interface SearchResult {
  id: string;
  type: string;
  name: string;
  category: string;
  icon: string;
}

export type Stage =
  | "login"
  | "otp"
  | "forgot-password"
  | "reset-otp"
  | "new-password";

export interface LoginStage {
  stage: Stage;
  email: string;
}
