import { Language } from "../global";

export interface FaqsResponse {
  data: Faq[];
  count: number;
}

export interface FaqResponse {
  data: Faq;
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

export type FaqFormValues = {
  order: number | null;
  translations: {
    en: {
      question: string;
      answer: string;
    };
    ka: {
      question: string;
      answer: string;
    };
  };
};
