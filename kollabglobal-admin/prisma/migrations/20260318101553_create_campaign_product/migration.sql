-- CreateTable
CREATE TABLE "campaign_products" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "selling_points" TEXT NOT NULL,
    "url" TEXT,
    "image_url" TEXT,
    "is_service" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,

    CONSTRAINT "campaign_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_products_campaign_id_key" ON "campaign_products"("campaign_id");

-- AddForeignKey
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
