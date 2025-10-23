import { File, Language } from "../global";

export interface NewsesResponse {
  data: News[];
  count: number;
}

export interface NewsResponse {
  data: News;
}

export interface News {
  id: string;
  slug: string;
  showInLanding: boolean;
  order: number;
  background: File | null;
  backgroundId: string;
  translations: NewsTranslation[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: File | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsTranslation {
  id: string;
  content: string;
  news: News;
  newsId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

export type NewsFormValues = {
  background: File | null;
  slug: string;
  showInLanding: boolean;
  order: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: File | null;
  translations: {
    en: {
      content: string;
    };
    ka: {
      content: string;
    };
  };
};
