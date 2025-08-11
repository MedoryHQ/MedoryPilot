/*
  Warnings:

  - You are about to drop the column `fileId` on the `about` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `introduce` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `themes` table. All the data in the column will be lost.
  - You are about to drop the `Footer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `user_info_at_visits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "page_components" DROP CONSTRAINT "page_components_footerId_fkey";

-- DropForeignKey
ALTER TABLE "socials" DROP CONSTRAINT "socials_footerId_fkey";

-- AlterTable
ALTER TABLE "about" DROP COLUMN "fileId";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "introduce" DROP COLUMN "fileId";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "fileId";

-- AlterTable
ALTER TABLE "themes" DROP COLUMN "fileId";

-- AlterTable
ALTER TABLE "user_info_at_visits" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Footer";

-- CreateTable
CREATE TABLE "footers" (
    "id" UUID NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "footers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_components" ADD CONSTRAINT "page_components_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "footers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
