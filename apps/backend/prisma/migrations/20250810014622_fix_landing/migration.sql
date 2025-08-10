/*
  Warnings:

  - You are about to drop the column `paymentProvider` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[socialId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE blogs_landingorder_seq;
ALTER TABLE "blogs" ALTER COLUMN "landingOrder" SET DEFAULT nextval('blogs_landingorder_seq');
ALTER SEQUENCE blogs_landingorder_seq OWNED BY "blogs"."landingOrder";

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "socialId" UUID;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paymentProvider";

-- DropEnum
DROP TYPE "PaymentProvider";

-- CreateTable
CREATE TABLE "Footer" (
    "id" UUID NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socials" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "footerId" UUID,

    CONSTRAINT "socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_components" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "footerOrder" SERIAL NOT NULL,
    "footerId" UUID,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "metaImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_component_translations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageComponentId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_component_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_components_slug_key" ON "page_components"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_component_translations_pageComponentId_languageId_key" ON "page_component_translations"("pageComponentId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "files_socialId_key" ON "files"("socialId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "socials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "Footer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_components" ADD CONSTRAINT "page_components_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "Footer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_component_translations" ADD CONSTRAINT "page_component_translations_pageComponentId_fkey" FOREIGN KEY ("pageComponentId") REFERENCES "page_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_component_translations" ADD CONSTRAINT "page_component_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
