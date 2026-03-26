-- CreateTable
CREATE TABLE "payment_events" (
    "id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_events_charge_id_idx" ON "payment_events"("charge_id");
