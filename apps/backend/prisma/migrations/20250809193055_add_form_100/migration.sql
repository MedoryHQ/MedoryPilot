-- CreateEnum
CREATE TYPE "TransmittedDiseaseType" AS ENUM ('SURGICAL_INTERVENTIONS', 'DISEASE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GEL', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('FLITT', 'PAYPAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Portal" AS ENUM ('GOOGLE_MEET', 'VIBER', 'WHATSAPP');

-- DropForeignKey
ALTER TABLE "diseases" DROP CONSTRAINT "diseases_examinationSheetId_fkey";

-- DropIndex
DROP INDEX "diseases_examinationSheetId_key";

-- AlterTable
ALTER TABLE "diseases" ADD COLUMN     "form100Id" UUID,
ALTER COLUMN "examinationSheetId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "linkOfMeet" TEXT,
ADD COLUMN     "portal" "Portal" NOT NULL DEFAULT 'GOOGLE_MEET';

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "visitId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'FLITT',
    "paymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'GEL',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transmitted_diseases" (
    "id" UUID NOT NULL,
    "year" INTEGER,
    "comment" TEXT,
    "type" "TransmittedDiseaseType" NOT NULL DEFAULT 'DISEASE',
    "icdId" UUID,
    "form100Id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transmitted_diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_100" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "notifyingInstitution" TEXT,
    "recipientsAddress" TEXT,
    "address" TEXT,
    "workplaceAndPosition" TEXT,
    "healthReport" TEXT,
    "briefHistory" TEXT,
    "briefHistoryComment" TEXT,
    "transmittedDiseasesComment" TEXT,
    "diagnosticExaminations" TEXT,
    "diagnosticExaminationsComment" TEXT,
    "courseOfIllness" TEXT,
    "treatmentPerformed" TEXT,
    "ConditionAtHospitalization" TEXT,
    "conditionAtDischarge" TEXT,
    "treatmentRecommendations" TEXT,
    "medicines" TEXT,
    "recommendation" TEXT,
    "analysesBeforeNextVisit" TEXT,
    "researches" TEXT,
    "userId" UUID NOT NULL,
    "examinationSheetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_100_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_100_dates" (
    "id" UUID NOT NULL,
    "dateOfConsultation" TIMESTAMP(3),
    "dateOfSendToHospitalization" TIMESTAMP(3),
    "dateOfHospitalization" TIMESTAMP(3),
    "dateOfDischarge" TIMESTAMP(3),
    "form100Id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_100_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_visitId_key" ON "transactions"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_paymentId_key" ON "transactions"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "form_100_userId_key" ON "form_100"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "form_100_examinationSheetId_key" ON "form_100"("examinationSheetId");

-- CreateIndex
CREATE UNIQUE INDEX "form_100_dates_form100Id_key" ON "form_100_dates"("form100Id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diseases" ADD CONSTRAINT "diseases_form100Id_fkey" FOREIGN KEY ("form100Id") REFERENCES "form_100"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diseases" ADD CONSTRAINT "diseases_examinationSheetId_fkey" FOREIGN KEY ("examinationSheetId") REFERENCES "user_info_at_visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transmitted_diseases" ADD CONSTRAINT "transmitted_diseases_icdId_fkey" FOREIGN KEY ("icdId") REFERENCES "icd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transmitted_diseases" ADD CONSTRAINT "transmitted_diseases_form100Id_fkey" FOREIGN KEY ("form100Id") REFERENCES "form_100"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_100" ADD CONSTRAINT "form_100_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_100" ADD CONSTRAINT "form_100_examinationSheetId_fkey" FOREIGN KEY ("examinationSheetId") REFERENCES "user_info_at_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_100_dates" ADD CONSTRAINT "form_100_dates_form100Id_fkey" FOREIGN KEY ("form100Id") REFERENCES "form_100"("id") ON DELETE CASCADE ON UPDATE CASCADE;
