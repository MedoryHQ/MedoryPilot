import { Language } from "../global";
import { Disease } from "./examination-sheet";
import { TransmittedDisease } from "./form100";

export interface ICDResponse {
  data: ICD;
}

export interface ICDsResponse {
  data: ICD[];
  count: number;
}

export interface ICD {
  id: string;

  code: string;
  link?: string | null;

  translations: ICDTranslation[];
  diseases: Disease[];
  transmittedDiseases: TransmittedDisease[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ICDTranslation {
  id: string;

  name: string;
  description?: string | null;

  icd: ICD;
  icdId: string;
  language: Language;
  languageId: string;

  createdAt?: string;
  updatedAt?: string;
}
