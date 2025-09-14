import { Translations, File } from "../global";

export interface CreateHeaderDTO {
  logo: File | null;
  active?: boolean;
  translations: Translations;
}

export interface UpdateHeaderDTO extends CreateHeaderDTO {
  id: string;
}

export interface GetTariffDTO {
  type: "active" | "history";
}

export interface DeleteTariffDTO extends GetTariffDTO {}
