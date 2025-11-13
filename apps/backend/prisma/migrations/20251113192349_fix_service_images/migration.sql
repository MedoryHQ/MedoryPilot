/*
  Warnings:

  - You are about to drop the column `backgroundId` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_backgroundId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_iconId_fkey";

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "serviceId" UUID;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "backgroundId";

-- CreateIndex
CREATE UNIQUE INDEX "files_serviceId_key" ON "files"("serviceId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
