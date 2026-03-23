/*
  Warnings:

  - You are about to drop the column `discount_pct` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_creator` on the `packages` table. All the data in the column will be lost.
  - Added the required column `cpm_label` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpm_savings` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagline` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "packages" DROP COLUMN IF EXISTS "discount_pct",
DROP COLUMN IF EXISTS "price_per_creator",
ADD COLUMN IF NOT EXISTS "cpm_label" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "cpm_savings" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tagline" TEXT NOT NULL DEFAULT '';
-- Remove the temporary defaults after backfill (seed will populate real values)
ALTER TABLE "packages" ALTER COLUMN "cpm_label" DROP DEFAULT,
ALTER COLUMN "cpm_savings" DROP DEFAULT,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "tagline" DROP DEFAULT;
