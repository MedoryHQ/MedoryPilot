import {
  VisitType,
  File,
  Language,
  User,
  VisitStatus,
  Portal,
  Currency,
  TransactionStatus,
  ExaminationSheetStatus,
  CaseType,
  BloodGroup,
  ResultOfEpisode,
  InformedConsent,
  LevelOfDisease,
  DiseaseType,
  TypeOfDiagnosis,
  TransmittedDiseaseType,
  RecipeUnitType,
  RecipeUnitUsageInterval,
  RecipeUnitUsagePeriod,
  EatingRule,
} from ".";
import { Service } from "./website";

export interface Visit {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  price?: number | null;
  type: VisitType;
  status: VisitStatus;
  portal: Portal;
  linkOfMeet?: string | null;
  followUpNeeded?: boolean | null;
  followUpStartDatePeriod?: string | null;
  followUpEndDatePeriod?: string | null;

  transaction?: Transaction | null;
  documents: File[];
  examinationSheet?: ExaminationSheet | null;

  user: User;
  userId: string;
  service: Service;
  serviceId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;

  visit: Visit;
  visitId: string;

  user: User;
  userId: string;

  paymentId?: string | null;
  amount: number;
  currency: Currency;
  status: TransactionStatus;

  paidAt?: string | null;
  refundedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
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

export interface TransmittedDisease {
  id: string;

  year?: number | null;
  comment?: string | null;
  type: TransmittedDiseaseType;

  icd?: ICD | null;
  icdId?: string | null;

  Form100?: Form100 | null;
  form100Id?: string | null;

  createdAt?: string;
  updatedAt?: string;
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

export interface Form100 {
  id: string;

  date: string;
  code: string;

  notifyingInstitution?: string | null;
  recipientsAddress?: string | null;
  address?: string | null;
  workplaceAndPosition?: string | null;
  healthReport?: string | null;
  briefHistory?: string | null;
  briefHistoryComment?: string | null;
  transmittedDiseasesComment?: string | null;
  diagnosticExaminations?: string | null;
  diagnosticExaminationsComment?: string | null;
  courseOfIllness?: string | null;
  treatmentPerformed?: string | null;
  ConditionAtHospitalization?: string | null;
  conditionAtDischarge?: string | null;
  treatmentRecommendations?: string | null;
  medicines?: string | null;
  recommendation?: string | null;
  analysesBeforeNextVisit?: string | null;
  researches?: string | null;

  dates?: Form100Dates | null;
  diagnoses: Disease[];
  transmittedDiseases: TransmittedDisease[];

  user: User;
  userId: string;

  examinationSheet: ExaminationSheet;
  examinationSheetId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Form100Dates {
  id: string;

  dateOfConsultation?: string | null;
  dateOfSendToHospitalization?: string | null;
  dateOfHospitalization?: string | null;
  dateOfDischarge?: string | null;

  form100: Form100;
  form100Id: string;

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
