import { Translations, File } from "../global";

export interface CreateHeaderDTO {
  logo: File | null;
  active?: boolean;
  translations: Translations;
}

export interface UpdateHeaderDTO extends CreateHeaderDTO {
  id: string;
}

export type TariffType = "active" | "history";

export interface GetTariffDTO {
  type: TariffType;
  id?: string;
}

export interface DeleteTariffDTO {
  id: string;
  type: TariffType;
}

export interface CreateTariffDTO {
  price: number;
}

export interface UpdateTariffDTO {
  price: number;
}

export interface CreateFaqDTO {
  order?: number;
  translations: Translations;
}

export interface UpdateFaqDTO {
  order?: number;
  translations: Translations;
}

export interface CreateIntroduceDTO {
  translations: Translations;
}

export interface UpdateIntroduceDTO {
  translations: Translations;
}

export interface CreateServiceDTO {
  icon?: File;
  background?: File;
  translations: Translations;
}

export interface UpdateServiceDTO {
  icon?: File;
  background?: File;
  translations: Translations;
}

export interface CreateContactDTO {
  location?: string;
  background?: File;
  translations: Translations;
}

export interface UpdateContactDTO {
  location?: string;
  background?: File;
  translations: Translations;
}

export interface CreateNewsDTO {
  showInLanding: boolean;
  slug: string;
  order?: number;
  background?: File;
  translations: Translations;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
}

export interface UpdateNewsDTO {
  showInLanding: boolean;
  slug: string;
  order?: number;
  background?: File;
  translations: Translations;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
}

export interface CreateBlogDTO {
  slug: string;
  background?: File;
  showInLanding: boolean;
  landingOrder?: number;

  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;

  categories: string[];
  translations: Translations;
}

export interface UpdateBlogDTO extends CreateBlogDTO {}
