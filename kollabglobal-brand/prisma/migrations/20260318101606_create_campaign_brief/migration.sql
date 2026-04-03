-- CreateTable
CREATE TABLE "campaign_briefs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_th" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_briefs_campaign_id_key" ON "campaign_briefs"("campaign_id");

-- AddForeignKey
ALTER TABLE "campaign_briefs" ADD CONSTRAINT "campaign_briefs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
