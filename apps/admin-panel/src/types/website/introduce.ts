import { File, Language } from "../global";

export interface IntroducesResponse {
  data: Introduce[];
  count: number;
}

export interface IntroduceResponse {
  data: Introduce;
}

export interface Introduce {
  id: string;
  thumbnail?: File;
  video?: File;
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

export type IntroduceFormValues = {
  translations: {
    en: {
      headline: string;
      description: string;
    };
    ka: {
      headline: string;
      description: string;
    };
  };
};
