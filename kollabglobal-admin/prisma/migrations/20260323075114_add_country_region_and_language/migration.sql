-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "language_code" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "language_name" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'global';
