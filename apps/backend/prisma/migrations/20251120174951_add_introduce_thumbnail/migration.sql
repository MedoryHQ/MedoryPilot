/*
  Warnings:

  - You are about to drop the column `introduceId` on the `files` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_introduceId_fkey";

-- DropIndex
DROP INDEX "files_introduceId_key";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "introduceId";

-- AlterTable
ALTER TABLE "introduce" ADD COLUMN     "thumbnailId" UUID,
ADD COLUMN     "videoId" UUID;

-- AddForeignKey
ALTER TABLE "introduce" ADD CONSTRAINT "introduce_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introduce" ADD CONSTRAINT "introduce_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
