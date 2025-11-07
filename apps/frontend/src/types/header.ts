import { File, Language } from ".";

export interface HeaderResponse {
  data: Header;
}

export interface Header {
  id: string;
  logo: File | null;
  visits?: number;
  experience?: number;
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
