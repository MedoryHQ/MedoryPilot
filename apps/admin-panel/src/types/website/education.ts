import { File, Language } from "..";

export interface EducationsResponse {
  data: Education[];
  count: number;
}

export interface EducationResponse {
  data: Education;
}

export interface Education {
  id: string;
  icon?: File | null;
  link?: string;
  endDate?: string;
  fromDate: string;
  translations: EducationTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface EducationTranslation {
  id: string;
  name: string;
  degree: string;
  description: string;
  education: Education;
  educationId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
