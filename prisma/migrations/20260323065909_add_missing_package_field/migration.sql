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
ALTER TABLE "packages" DROP COLUMN "discount_pct",
DROP COLUMN "price_per_creator",
ADD COLUMN     "cpm_label" TEXT NOT NULL,
ADD COLUMN     "cpm_savings" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "tagline" TEXT NOT NULL;
