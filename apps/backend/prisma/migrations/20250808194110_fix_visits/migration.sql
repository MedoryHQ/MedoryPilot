-- AlterTable
ALTER TABLE "diseases" ALTER COLUMN "type" SET DEFAULT 'MAIN';

-- AlterTable
ALTER TABLE "visits" ALTER COLUMN "followUpNeeded" DROP NOT NULL,
ALTER COLUMN "followUpNeeded" DROP DEFAULT;
