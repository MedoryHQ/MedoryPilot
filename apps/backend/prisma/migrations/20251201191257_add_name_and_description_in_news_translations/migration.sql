/*
  Warnings:

  - Added the required column `name` to the `news_translations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "news_translations" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
