import { File, Language } from ".";

export interface ContactResponse {
  data: Contact;
}

export interface Contact {
  id: string;
  location?: string;
  background: File | null;
  translations: ContactTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactTranslation {
  id: string;
  title: string;
  description: string;
  contact: Contact;
  contactId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}
