-- AlterTable
ALTER TABLE "creators" ADD COLUMN     "country_id" INTEGER;

-- AddForeignKey
ALTER TABLE "creators" ADD CONSTRAINT "creators_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
