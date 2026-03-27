/*
  Warnings:

  - You are about to drop the column `flag` on the `countries` table. All the data in the column will be lost.
  - You are about to drop the column `country_flag` on the `creators` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "countries" DROP COLUMN "flag",
ADD COLUMN     "country_code" TEXT;

-- AlterTable
ALTER TABLE "creators" DROP COLUMN "country_flag",
ADD COLUMN     "country_code" TEXT;
