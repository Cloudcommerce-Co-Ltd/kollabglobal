-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "omise_charge_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_campaign_id_key" ON "payments"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_omise_charge_id_key" ON "payments"("omise_charge_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
