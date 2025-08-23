-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "smsCode" TEXT,
ADD COLUMN     "smsCodeExpiresAt" TIMESTAMP(3);
