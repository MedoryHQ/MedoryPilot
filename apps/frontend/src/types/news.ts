import { File, Language } from ".";

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
