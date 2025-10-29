import { File, Language } from ".";

export interface AboutResponse {
  data: About;
}

export interface About {
  id: string;
  image?: File | null;
  translations: AboutTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface AboutTranslation {
  id: string;
  headline: string;
  description: string;
  about: About;
  aboutId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
