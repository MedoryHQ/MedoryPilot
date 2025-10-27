import { Language } from ".";

export interface FaqsResponse {
  data: Faq[];
}

export interface Faq {
  id: string;
  order: number;
  translations: FaqTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqTranslation {
  id: string;
  question: string;
  answer: string;
  faq: Faq;
  faqId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
