import { File, Language } from ".";

export interface ServicesResponse {
  data: Service[];
}

export interface Service {
  id: string;
  icon?: File | null;
  translations: ServiceTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTranslation {
  id: string;
  title: string;
  description: string;
  service: Service;
  serviceId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
