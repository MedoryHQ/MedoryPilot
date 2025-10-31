export type VisitStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type VisitType = "ONLINE" | "IN_PERSON";
export type Portal = "GOOGLE_MEET" | "VIBER" | "WHATSAPP";
export type Currency = "GEL" | "USD" | "EUR";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type ExaminationSheetStatus = "DRAFT" | "FINALIZED";
export type CaseType = "URGENT" | "URGENT_DELAYED" | "PLANNED";
export type BloodGroup =
  | "IV_NEGATIVE"
  | "III_NEGATIVE"
  | "II_NEGATIVE"
  | "I_NEGATIVE"
  | "I_POSITIVE"
  | "II_POSITIVE"
  | "III_POSITIVE"
  | "IV_POSITIVE";
export type ResultOfEpisode = "FINISHED" | "UNFINISHED";
export type InformedConsent = "NOT_VISIBLE" | "VISIBLE";
export type LevelOfDisease =
  | "ACUTE"
  | "SUBACUTE"
  | "CHRONIC"
  | "RECURRENT"
  | "OTHER";
export type DiseaseType = "MAIN" | "COMPLICATION" | "ASSOCIATED";
export type TypeOfDiagnosis =
  | "FIRST_TIME"
  | "WAS_ESTABLISHED"
  | "PROBABLE_DIAGNOSIS";
export type TransmittedDiseaseType = "DISEASE" | "SURGICAL_INTERVENTIONS";
export type RecipeUnitType =
  | "UNIT"
  | "TABLET"
  | "CAPSULE"
  | "DRAGEE"
  | "SPRAY"
  | "AEROSOL"
  | "VIAL"
  | "TUBE"
  | "OINTMENT"
  | "CREAM"
  | "GEL"
  | "CANDLE"
  | "SASHE"
  | "AMPOULE"
  | "SYRUP"
  | "SUSPENSION"
  | "SOLUTION"
  | "INHALATION"
  | "SYRINGE_PEN";
export type RecipeUnitUsageInterval =
  | "HOURLY"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "SYMPTOMATICALLY";
export type RecipeUnitUsagePeriod = "HOURS" | "DAYS" | "WEEKS" | "MONTHS";
export type EatingRule =
  | "BEFORE_MEAL"
  | "AFTER_MEAL"
  | "DURING_MEAL"
  | "ON_EMPTY_STOMACH"
  | "BEFORE_SLEEP"
  | "SYMPTOMATICALLY";

export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";
export type MessageSender = "PATIENT" | "DOCTOR";
