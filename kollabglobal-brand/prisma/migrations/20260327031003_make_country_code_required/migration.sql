/*
  Warnings:

  - Made the column `country_code` on table `countries` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "countries" ALTER COLUMN "country_code" SET NOT NULL;
