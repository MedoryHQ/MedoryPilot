import {
  BloodGroup,
  CaseType,
  DiseaseType,
  EatingRule,
  ExaminationSheetStatus,
  InformedConsent,
  LevelOfDisease,
  RecipeUnitType,
  RecipeUnitUsageInterval,
  RecipeUnitUsagePeriod,
  ResultOfEpisode,
  TypeOfDiagnosis
} from "../enums";
import { Language } from "../global";
import { Form100 } from "./form100";
import { ICD } from "./icds";
import { Visit } from "./visit";

export interface ExaminationSheetResponse {
  data: ExaminationSheet;
}

export interface ExaminationSheetsResponse {
  data: ExaminationSheet[];
  count: number;
}

export interface ExaminationSheet {
  id: string;

  status: ExaminationSheetStatus;
  notes?: string | null;
  caseType?: CaseType | null;
  height?: number | null;
  weight?: number | null;
  bloodPressure?: string | null;
  heartRate?: number | null;
  breathingRate?: number | null;
  temperature?: number | null;
  spO2Level?: number | null;
  BMI?: number | null;

  form100?: Form100 | null;
  groupOfBlood?: BloodGroup | null;
  resultOfEpisode?: ResultOfEpisode | null;
  InformedConsent: InformedConsent;

  translations: ExaminationSheetTranslation[];
  diseases: Disease[];
  recipes: RecipeUnit[];

  visit: Visit;
  visitId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Disease {
  id: string;

  comment?: string | null;
  level?: LevelOfDisease | null;
  type: DiseaseType;
  typeOfDiagnosis?: TypeOfDiagnosis | null;

  icd?: ICD | null;
  icdId?: string | null;

  Form100?: Form100 | null;
  form100Id?: string | null;

  examinationSheet?: ExaminationSheet | null;
  examinationSheetId?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeUnit {
  id: string;

  genericName: string;
  code: string;
  validityPeriod?: number | null;
  type: RecipeUnitType;
  quantity: number;
  usageInterval: RecipeUnitUsageInterval;
  interval: number;
  period: number;
  periodUnit: RecipeUnitUsagePeriod;

  translations: RecipeUnitTranslation[];
  eatingRule?: EatingRule | null;

  examinationSheet: ExaminationSheet;
  examinationSheetId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ExaminationSheetTranslation {
  id: string;

  destinationSheet?: string | null;
  analysesBeforeNextVisit?: string | null;
  recommendation?: string | null;
  prescriptionSummary?: string | null;

  examinationSheet: ExaminationSheet;
  examinationSheetId: string;
  language: Language;
  languageId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeUnitTranslation {
  id: string;

  name: string;
  description: string;
  comment?: string | null;

  recipeUnit: RecipeUnit;
  recipeUnitId: string;

  language: Language;
  languageId: string;

  createdAt?: string;
  updatedAt?: string;
}
