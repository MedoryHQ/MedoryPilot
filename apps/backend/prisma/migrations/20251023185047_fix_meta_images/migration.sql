/*
  Warnings:

  - You are about to drop the column `metaImage` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `blogId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `newsId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `metaImage` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `metaImage` on the `page_components` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pageComponentId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_blogId_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_newsId_fkey";

-- DropIndex
DROP INDEX "files_blogId_key";

-- DropIndex
DROP INDEX "files_newsId_key";

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "metaImage",
ADD COLUMN     "backgroundId" UUID,
ADD COLUMN     "metaImageId" UUID;

-- AlterTable
ALTER TABLE "files" DROP COLUMN "blogId",
DROP COLUMN "newsId",
ADD COLUMN     "pageComponentId" UUID;

-- AlterTable
ALTER TABLE "news" DROP COLUMN "metaImage",
ADD COLUMN     "backgroundId" UUID,
ADD COLUMN     "metaImageId" UUID;

-- AlterTable
ALTER TABLE "page_components" DROP COLUMN "metaImage";

-- CreateIndex
CREATE UNIQUE INDEX "files_pageComponentId_key" ON "files"("pageComponentId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_pageComponentId_fkey" FOREIGN KEY ("pageComponentId") REFERENCES "page_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_metaImageId_fkey" FOREIGN KEY ("metaImageId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_metaImageId_fkey" FOREIGN KEY ("metaImageId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
