import { Language } from ".";

export interface IntroduceResponse {
  data: Introduce;
}

export interface Introduce {
  id: string;
  translations: IntroduceTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface IntroduceTranslation {
  id: string;
  headline: string;
  description: string;
  introduce: Introduce;
  introduceId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
