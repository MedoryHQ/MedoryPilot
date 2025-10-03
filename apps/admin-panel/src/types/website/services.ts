import { File, Language } from "../global";

export interface ServicesResponse {
  data: Service[];
  count: number;
}

export interface ServiceResponse {
  data: Service;
}

export interface Service {
  id: string;
  icon: File | null;
  iconId: string;
  background: File | null;
  backgroundId: string;
  visits: any[]; // TODO: Add visits type
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

export type ServiceFormValues = {
  icon: File | null;
  background: File | null;
  translations: {
    en: {
      title: string;
      description: string;
    };
    ka: {
      title: string;
      description: string;
    };
  };
};
