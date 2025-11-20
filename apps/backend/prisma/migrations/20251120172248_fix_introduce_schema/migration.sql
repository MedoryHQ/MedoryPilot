/*
  Warnings:

  - A unique constraint covering the columns `[introduceId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "introduceId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "files_introduceId_key" ON "files"("introduceId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_introduceId_fkey" FOREIGN KEY ("introduceId") REFERENCES "introduce"("id") ON DELETE SET NULL ON UPDATE CASCADE;
