import { User } from "./user";

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
  | "verify-otp"
  | "forgot-password"
  | "forgot-password-otp"
  | "new-password";

export interface LoginStage {
  stage: Stage;
  email: string;
}

export interface RefreshToken {
  id: string;
  user: User;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type Mode = "multiple" | "tags" | undefined;

export interface Option {
  label: React.ReactNode;
  value: string | number;
}

export interface TranslatedSelectProps {
  label?: string;
  endpoints: string[] | string;
  translationKey: string | string[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: any) => void;
  mode?: Mode;
  enabled?: boolean;
  onFetch?: (data: any) => void;
  labelInValue?: boolean;
  labelKey?: string;
  onUpdate?: (option: Option) => void;
  defaultValue?: string | string[] | number;
  value?: string | number | (string | number)[];
  error?: string | null;
  required?: boolean;
}

export type PickedLocation = {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  translations?: { en?: string; ka?: string };
};

export interface LocationPickerProps {
  id?: string;
  className?: string;
  label?: React.ReactNode;
  value?: string | null;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (address: string) => void;
  onChangeFull?: (picked: PickedLocation | null) => void;
  onValidate?: (err?: string) => void;
  defaultCenter?: { lat: number; lng: number };
  mapHeight?: string;
}
