/*
  Warnings:

  - You are about to drop the column `stars` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the `_BlogStars` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BlogStars" DROP CONSTRAINT "_BlogStars_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlogStars" DROP CONSTRAINT "_BlogStars_B_fkey";

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "stars";

-- DropTable
DROP TABLE "_BlogStars";

-- CreateTable
CREATE TABLE "blog_stars" (
    "id" UUID NOT NULL,
    "blogId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "star" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_stars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_stars_blogId_key" ON "blog_stars"("blogId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_stars_userId_key" ON "blog_stars"("userId");

-- AddForeignKey
ALTER TABLE "blog_stars" ADD CONSTRAINT "blog_stars_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_stars" ADD CONSTRAINT "blog_stars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
