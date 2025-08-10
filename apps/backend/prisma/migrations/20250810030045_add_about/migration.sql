/*
  Warnings:

  - You are about to drop the column `fileId` on the `header` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aboutId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[educationId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[experienceId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[videoId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `header_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `header_translations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Footer" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "aboutId" UUID,
ADD COLUMN     "educationId" UUID,
ADD COLUMN     "experienceId" UUID,
ADD COLUMN     "videoId" UUID;

-- AlterTable
ALTER TABLE "header" DROP COLUMN "fileId";

-- AlterTable
ALTER TABLE "header_translations" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "about" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileId" TEXT,

    CONSTRAINT "about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" UUID NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" UUID NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "link" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3),
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_translations" (
    "id" UUID NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "aboutId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "educationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "experienceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "languageId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "about_translations_aboutId_languageId_key" ON "about_translations"("aboutId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "education_translations_educationId_languageId_key" ON "education_translations"("educationId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "experience_translations_experienceId_languageId_key" ON "experience_translations"("experienceId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "video_translations_videoId_languageId_key" ON "video_translations"("videoId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "files_aboutId_key" ON "files"("aboutId");

-- CreateIndex
CREATE UNIQUE INDEX "files_educationId_key" ON "files"("educationId");

-- CreateIndex
CREATE UNIQUE INDEX "files_experienceId_key" ON "files"("experienceId");

-- CreateIndex
CREATE UNIQUE INDEX "files_videoId_key" ON "files"("videoId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "about"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "educations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_translations" ADD CONSTRAINT "about_translations_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "about"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_translations" ADD CONSTRAINT "about_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_translations" ADD CONSTRAINT "education_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_translations" ADD CONSTRAINT "education_translations_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "educations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_translations" ADD CONSTRAINT "experience_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_translations" ADD CONSTRAINT "experience_translations_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_translations" ADD CONSTRAINT "video_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_translations" ADD CONSTRAINT "video_translations_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
