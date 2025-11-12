import { File, Language } from "../global";

export interface HerosResponse {
  data: Hero[];
  count: number;
}

export interface HeroResponse {
  data: Hero;
}

export interface Hero {
  id: string;
  logo: File | null;
  experience?: number;
  visits?: number;
  active: boolean | null;
  translations: HeroTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface HeroTranslation {
  id: string;
  name: string;
  position: string;
  headline: string;
  description: string;
  hero: Hero;
  heroId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

export type HeroFormValues = {
  logo: {
    name: string;
    path: string;
    size: number;
  } | null;
  active: boolean | null;
  experience?: number;
  visits?: number;
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
