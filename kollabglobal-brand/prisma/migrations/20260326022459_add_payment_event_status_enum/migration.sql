/*
  Warnings:

  - You are about to drop the column `processed_at` on the `payment_events` table. All the data in the column will be lost.
  - Changed the type of `status` on the `payment_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentEventStatus" AS ENUM ('SUCCESSFUL', 'FAILED', 'EXPIRED', 'REVERSED');

-- AlterTable
ALTER TABLE "payment_events" DROP COLUMN "processed_at",
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentEventStatus" NOT NULL;
