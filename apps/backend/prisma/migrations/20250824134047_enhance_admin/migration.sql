/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "twoFactorAuth" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "visitReminder" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "adminId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "files_adminId_key" ON "files"("adminId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
