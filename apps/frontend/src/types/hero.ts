import { File, Language } from ".";

export interface HeroResponse {
  data: Hero;
}

export interface Hero {
  id: string;
  logo: File | null;
  visits?: number;
  experience?: number;
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
