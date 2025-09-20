/*
  Warnings:

  - Made the column `order` on table `news` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
CREATE SEQUENCE news_order_seq;
ALTER TABLE "news" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "order" SET DEFAULT nextval('news_order_seq');
ALTER SEQUENCE news_order_seq OWNED BY "news"."order";
