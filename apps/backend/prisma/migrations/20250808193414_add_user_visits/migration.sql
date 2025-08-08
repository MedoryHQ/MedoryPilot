/*
  Warnings:

  - A unique constraint covering the columns `[visitId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirth` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `personalId` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordHash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('ONLINE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('URGENT', 'URGENT_DELAYED', 'PLANNED');

-- CreateEnum
CREATE TYPE "LevelOfDisease" AS ENUM ('ACUTE', 'SUBACUTE', 'CHRONIC', 'RECURRENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TypeOfDiagnosis" AS ENUM ('FIRST_TIME', 'WAS_ESTABLISHED', 'PROBABLE_DIAGNOSIS');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('IV_NEGATIVE', 'III_NEGATIVE', 'II_NEGATIVE', 'I_NEGATIVE', 'I_POSITIVE', 'II_POSITIVE', 'III_POSITIVE', 'IV_POSITIVE');

-- CreateEnum
CREATE TYPE "ResultOfEpisode" AS ENUM ('FINISHED', 'UNFINISHED');

-- CreateEnum
CREATE TYPE "DiseaseType" AS ENUM ('MAIN', 'COMPLICATION', 'ASSOCIATED');

-- CreateEnum
CREATE TYPE "ExaminationSheetStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateEnum
CREATE TYPE "InformedConsent" AS ENUM ('VISIBLE', 'NOT_VISIBLE');

-- CreateEnum
CREATE TYPE "RecipeUnitType" AS ENUM ('UNIT', 'TABLET', 'CAPSULE', 'DRAGEE', 'SPRAY', 'AEROSOL', 'VIAL', 'TUBE', 'OINTMENT', 'CREAM', 'GEL', 'CANDLE', 'SASHE', 'AMPOULE', 'SYRUP', 'SUSPENSION', 'SOLUTION', 'INHALATION', 'SYRINGE_PEN');

-- CreateEnum
CREATE TYPE "RecipeUnitUsageInterval" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'SYMPTOMATICALLY');

-- CreateEnum
CREATE TYPE "RecipeUnitUsagePeriod" AS ENUM ('HOURS', 'DAYS', 'WEEKS', 'MONTHS');

-- CreateEnum
CREATE TYPE "EatingRule" AS ENUM ('BEFORE_MEAL', 'AFTER_MEAL', 'DURING_MEAL', 'ON_EMPTY_STOMACH', 'BEFORE_SLEEP', 'SYMPTOMATICALLY');

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "visitId" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "info" TEXT,
ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "personalId" SET NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateTable
CREATE TABLE "examination_sheet_translations" (
    "id" UUID NOT NULL,
    "destinationSheet" TEXT,
    "analysesBeforeNextVisit" TEXT,
    "recommendation" TEXT,
    "prescriptionSummary" TEXT,
    "examinationSheetId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examination_sheet_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icd_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icdId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icd_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_unit_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "comment" TEXT,
    "recipeUnitId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_unit_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "price" INTEGER,
    "type" "VisitType" NOT NULL DEFAULT 'ONLINE',
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpStartDatePeriod" TIMESTAMP(3),
    "followUpEndDatePeriod" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_info_at_visits" (
    "id" UUID NOT NULL,
    "status" "ExaminationSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "caseType" "CaseType",
    "height" INTEGER,
    "weight" INTEGER,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "breathingRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "spO2Level" DOUBLE PRECISION,
    "BMI" DOUBLE PRECISION,
    "groupOfBlood" "BloodGroup",
    "resultOfEpisode" "ResultOfEpisode",
    "InformedConsent" "InformedConsent" NOT NULL DEFAULT 'NOT_VISIBLE',
    "visitId" UUID NOT NULL,

    CONSTRAINT "user_info_at_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diseases" (
    "id" UUID NOT NULL,
    "comment" TEXT,
    "level" "LevelOfDisease",
    "type" "DiseaseType" NOT NULL,
    "typeOfDiagnosis" "TypeOfDiagnosis",
    "icdId" UUID,
    "examinationSheetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icd" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_units" (
    "id" UUID NOT NULL,
    "genericName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "validityPeriod" INTEGER,
    "type" "RecipeUnitType" NOT NULL DEFAULT 'TABLET',
    "quantity" INTEGER NOT NULL,
    "usageInterval" "RecipeUnitUsageInterval" NOT NULL DEFAULT 'DAILY',
    "interval" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "periodUnit" "RecipeUnitUsagePeriod" NOT NULL DEFAULT 'DAYS',
    "eatingRule" "EatingRule",
    "examinationSheetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "examination_sheet_translations_examinationSheetId_languageI_key" ON "examination_sheet_translations"("examinationSheetId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "icd_translations_icdId_languageId_key" ON "icd_translations"("icdId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_unit_translations_recipeUnitId_languageId_key" ON "recipe_unit_translations"("recipeUnitId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "visits_userId_serviceId_key" ON "visits"("userId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_info_at_visits_visitId_key" ON "user_info_at_visits"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_examinationSheetId_key" ON "diseases"("examinationSheetId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_units_examinationSheetId_key" ON "recipe_units"("examinationSheetId");

-- CreateIndex
CREATE UNIQUE INDEX "files_visitId_key" ON "files"("visitId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_sheet_translations" ADD CONSTRAINT "examination_sheet_translations_examinationSheetId_fkey" FOREIGN KEY ("examinationSheetId") REFERENCES "user_info_at_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_sheet_translations" ADD CONSTRAINT "examination_sheet_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icd_translations" ADD CONSTRAINT "icd_translations_icdId_fkey" FOREIGN KEY ("icdId") REFERENCES "icd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icd_translations" ADD CONSTRAINT "icd_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_unit_translations" ADD CONSTRAINT "recipe_unit_translations_recipeUnitId_fkey" FOREIGN KEY ("recipeUnitId") REFERENCES "recipe_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_unit_translations" ADD CONSTRAINT "recipe_unit_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_info_at_visits" ADD CONSTRAINT "user_info_at_visits_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diseases" ADD CONSTRAINT "diseases_icdId_fkey" FOREIGN KEY ("icdId") REFERENCES "icd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diseases" ADD CONSTRAINT "diseases_examinationSheetId_fkey" FOREIGN KEY ("examinationSheetId") REFERENCES "user_info_at_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_units" ADD CONSTRAINT "recipe_units_examinationSheetId_fkey" FOREIGN KEY ("examinationSheetId") REFERENCES "user_info_at_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
