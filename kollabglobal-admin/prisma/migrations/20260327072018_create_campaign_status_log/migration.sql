-- CreateTable
CREATE TABLE "campaign_status_logs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "from_status" "CampaignStatus" NOT NULL,
    "to_status" "CampaignStatus" NOT NULL,
    "changed_by" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_status_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campaign_status_logs" ADD CONSTRAINT "campaign_status_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_status_logs" ADD CONSTRAINT "campaign_status_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
