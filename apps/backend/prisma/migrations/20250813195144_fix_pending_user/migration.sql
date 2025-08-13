/*
  Warnings:

  - Made the column `smsCodeExpiresAt` on table `pending_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pending_users" ALTER COLUMN "smsCodeExpiresAt" SET NOT NULL;
