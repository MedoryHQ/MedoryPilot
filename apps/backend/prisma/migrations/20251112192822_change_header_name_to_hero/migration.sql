/*
  Warnings:

  - You are about to drop the column `headerId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the `header` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `header_translations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[heroId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_headerId_fkey";

-- DropForeignKey
ALTER TABLE "header_translations" DROP CONSTRAINT "header_translations_headerId_fkey";

-- DropForeignKey
ALTER TABLE "header_translations" DROP CONSTRAINT "header_translations_languageId_fkey";

-- DropIndex
DROP INDEX "files_headerId_key";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "headerId",
ADD COLUMN     "heroId" UUID;

-- DropTable
DROP TABLE "header";

-- DropTable
DROP TABLE "header_translations";

-- CreateTable
CREATE TABLE "hero" (
    "id" UUID NOT NULL,
    "active" BOOLEAN,
    "experience" INTEGER,
    "visits" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heroId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hero_translations_heroId_languageId_key" ON "hero_translations"("heroId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "files_heroId_key" ON "files"("heroId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_translations" ADD CONSTRAINT "hero_translations_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_translations" ADD CONSTRAINT "hero_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
