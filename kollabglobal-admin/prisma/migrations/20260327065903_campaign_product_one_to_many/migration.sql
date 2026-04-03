-- DropIndex
DROP INDEX "campaign_products_campaign_id_key";

-- AlterTable
ALTER TABLE "campaign_creators" ADD COLUMN     "product_id" TEXT;

-- AddForeignKey
ALTER TABLE "campaign_creators" ADD CONSTRAINT "campaign_creators_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "campaign_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
