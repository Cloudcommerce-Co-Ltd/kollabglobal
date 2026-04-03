/*
  Warnings:

  - The primary key for the `countries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `countries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `packages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `packages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `country_id` on the `campaigns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `package_id` on the `campaigns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_country_id_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_package_id_fkey";

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "country_id",
ADD COLUMN     "country_id" INTEGER NOT NULL,
DROP COLUMN "package_id",
ADD COLUMN     "package_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "countries" DROP CONSTRAINT "countries_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "packages" DROP CONSTRAINT "packages_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "packages_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
