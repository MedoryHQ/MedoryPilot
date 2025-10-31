import { TransmittedDiseaseType } from "../enums";
import { User } from "../user";
import { Disease, ExaminationSheet } from "./examination-sheet";
import { ICD } from "./icds";

export interface Form100Response {
  data: Form100;
}

export interface Form100sResponse {
  data: Form100[];
  count: number;
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
