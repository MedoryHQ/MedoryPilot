import { Translations, File } from "../global";

export interface CreateHeaderDTO {
  icon: File | null;
  active?: boolean;
  translations: Translations;
}
