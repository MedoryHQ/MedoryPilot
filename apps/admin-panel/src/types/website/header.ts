import { File, Language } from "../global";

export interface HeadersResponse {
  data: Header[];
  count: number;
}

export interface HeaderResponse {
  data: Header;
}

export interface Header {
  id: string;
  logo: File | null;
  active: boolean | null;
  translations: HeaderTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface HeaderTranslation {
  id: string;
  name: string;
  position: string;
  headline: string;
  description: string;
  header: Header;
  headerId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

export type HeaderFormValues = {
  logo: {
    name: string;
    path: string;
    size: number;
  } | null;
  active: boolean | null;
  translations: {
    en: {
      name: string;
      position: string;
      headline: string;
      description: string;
    };
    ka: {
      name: string;
      position: string;
      headline: string;
      description: string;
    };
  };
};
