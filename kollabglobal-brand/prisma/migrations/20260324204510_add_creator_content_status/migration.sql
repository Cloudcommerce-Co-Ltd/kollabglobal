-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('NOT_STARTED', 'CREATING', 'SUBMITTED', 'POSTED');

-- AlterTable
ALTER TABLE "campaign_creators" ADD COLUMN     "content_status" "ContentStatus" NOT NULL DEFAULT 'NOT_STARTED';
