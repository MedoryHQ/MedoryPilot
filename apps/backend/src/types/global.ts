export type Pagination = {
  skip: number;
  take: number;
  programId?: string;
  orderBy: {
    [key: string]: "asc" | "desc";
  };
  search?: string;
};

export type AuthUser = { id: string };

export type Translations = {
  [key: string]: Translation;
};

export type Translation = {
  [languageCode: string]: {
    [key: string]: string;
  };
};

export type BooleanQuery = "true" | "false" | undefined;

export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  order?: number;
}

export type cookieOptionsTypes = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none" | "lax" | "strict";
  domain: string | undefined;
  path: string;
};

export interface User {
  id: string;
  phoneNumber: string;
}

export type ErrorMessages = Record<string, { en: string; ka: string }>;
