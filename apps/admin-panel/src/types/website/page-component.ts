import { Language } from "../global";
import { Footer } from "./footer";

export interface PageComponentsResponse {
  data: PageComponent[];
  count: number;
}

export interface PageComponentResponse {
  data: PageComponent;
}

export interface PageComponent {
  id: string;
  slug: string;
  footerOrder: number;
  footer: Footer;
  footerId: string;
  translations: PageComponentTranslation[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: File | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageComponentTranslation {
  id: string;
  name: string;
  content: string;
  pageComponent: PageComponent;
  pageComponentId: string;
  language: Language;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

export type PageComponentFormValues = {
  slug: string;
  footerOrder: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaImage: File | null;
  translations: {
    en: {
      content: string;
      name: string;
    };
    ka: {
      content: string;
      name: string;
    };
  };
};
