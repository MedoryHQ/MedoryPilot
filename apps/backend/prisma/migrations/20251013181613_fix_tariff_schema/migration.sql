/*
  Warnings:

  - You are about to drop the `tariffs_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tariffs_history" DROP CONSTRAINT "tariffs_history_tariffId_fkey";

-- AlterTable
ALTER TABLE "tariffs" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "fromDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" UUID,
ALTER COLUMN "price" SET DEFAULT 0;

-- DropTable
DROP TABLE "tariffs_history";

-- CreateIndex
CREATE INDEX "tariffs_parentId_idx" ON "tariffs"("parentId");

-- CreateIndex
CREATE INDEX "tariffs_isCurrent_idx" ON "tariffs"("isCurrent");

-- AddForeignKey
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tariffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
