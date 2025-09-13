import { Translations, File } from "../global";

export interface CreateHeaderDTO {
  logo: File | null;
  active?: boolean;
  translations: Translations;
}

export interface UpdateHeaderDTO extends CreateHeaderDTO {
  id: string;
}
