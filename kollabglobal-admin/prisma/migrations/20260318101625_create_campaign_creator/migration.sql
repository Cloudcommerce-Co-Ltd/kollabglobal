-- CreateTable
CREATE TABLE "campaign_creators" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "status" "CreatorStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "campaign_creators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_creators_campaign_id_creator_id_key" ON "campaign_creators"("campaign_id", "creator_id");

-- AddForeignKey
ALTER TABLE "campaign_creators" ADD CONSTRAINT "campaign_creators_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_creators" ADD CONSTRAINT "campaign_creators_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
