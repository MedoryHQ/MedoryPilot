import { File, Language } from ".";

export interface ExperiencesResponse {
  data: Experience[];
  count: number;
}

export interface Experience {
  id: string;
  icon?: File | null;
  link?: string;
  endDate?: string;
  fromDate: string;
  location?: string;
  translations: ExperienceTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceTranslation {
  id: string;
  name: string;
  position: string;
  description: string;
  experience: Experience;
  experienceId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
