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

export type UpdateTariffDTO = CreateTariffDTO;

export interface CreateFaqDTO {
  order?: number;
  translations: Translations;
}

export type UpdateFaqDTO = CreateFaqDTO;

export interface CreateIntroduceDTO {
  translations: Translations;
}

export type UpdateIntroduceDTO = CreateIntroduceDTO;

export interface CreateServiceDTO {
  icon?: File;
  background?: File | null;
  translations: Translations;
}

export type UpdateServiceDTO = CreateServiceDTO;

export interface CreateContactDTO {
  location?: string;
  background?: File | null;
  translations: Translations;
}

export type UpdateContactDTO = CreateContactDTO;

export interface CreateNewsDTO {
  showInLanding: boolean;
  slug: string;
  order?: number;
  background?: File | null;
  translations: Translations;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaImage?: File | null;
}

export type UpdateNewsDTO = CreateNewsDTO;

export interface CreateBlogDTO {
  slug: string;
  background?: File | null;
  showInLanding: boolean;
  landingOrder?: number;

  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaImage?: File | null;

  categories: string[];
  translations: Translations;
}

export type UpdateBlogDTO = CreateBlogDTO;

export interface CreatePageComponentDTO {
  slug: string;
  footerOrder?: number;
  footerId?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaImage?: File | null;

  translations: Translations;
}

export type UpdatePageComponentDTO = CreatePageComponentDTO;

export interface CreateSocialDTO {
  name: string;
  url: string;
  icon?: File | null;
  footerId?: string;
}

export type UpdateSocialDTO = CreateSocialDTO;

export interface CreateFooterDTO {
  phone?: string;
  email?: string;
  socials: string[];
  pages: string[];
}

export type UpdateFooterDTO = CreateFooterDTO;

export interface CreateCategoryDTO {
  translations: Translations;
}

export type UpdateCategoryDTO = CreateCategoryDTO;
