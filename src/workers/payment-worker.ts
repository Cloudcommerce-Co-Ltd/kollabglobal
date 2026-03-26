// Standalone BullMQ worker — run via `pnpm worker` or `pnpm worker:dev`.
// Consumes jobs from the `payment-events` queue and performs DB state transitions.
import { Worker, type Job } from "bullmq";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";
import {
  PaymentStatus,
  CampaignStatus,
  PaymentEventStatus,
  type Prisma,
} from "@/generated/prisma/client";
import {
  PAYMENT_EVENTS_QUEUE,
  type PaymentEventJobData,
  type OmiseChargeStatus,
} from "@/lib/queue/payment-queue";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapChargeStatusToEnum(chargeStatus: OmiseChargeStatus): PaymentEventStatus {
  switch (chargeStatus) {
    case "successful": return PaymentEventStatus.SUCCESSFUL;
    case "failed":     return PaymentEventStatus.FAILED;
    case "expired":    return PaymentEventStatus.EXPIRED;
    case "reversed":   return PaymentEventStatus.REVERSED;
    default:           return PaymentEventStatus.FAILED;
  }
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

async function processPaymentEvent(job: Job<PaymentEventJobData>): Promise<void> {
  const { chargeId, chargeStatus, omiseEventKey } = job.data;

  // 1. Look up payment by Omise charge ID
  const payment = await prisma.payment.findFirst({
    where: { omiseChargeId: chargeId },
  });

  // 2. Idempotent — no payment record means nothing to update
  if (!payment) {
    console.log(`[payment-worker] No payment found for chargeId ${chargeId} — skipping`);
    return;
  }

  // 3. State guard — only transition PENDING payments; ignore replayed/out-of-order
  if (payment.status !== PaymentStatus.PENDING) {
    console.log(
      `[payment-worker] Payment ${payment.id} is ${payment.status} — skipping (idempotent)`,
    );
    return;
  }

  // 4. Determine new statuses
  let newPaymentStatus: PaymentStatus;
  let newCampaignStatus: CampaignStatus;

  if (chargeStatus === "successful") {
    newPaymentStatus = PaymentStatus.COMPLETED;
    newCampaignStatus = CampaignStatus.PENDING;
  } else if (chargeStatus === "failed" || chargeStatus === "expired") {
    newPaymentStatus = PaymentStatus.FAILED;
    newCampaignStatus = CampaignStatus.CANCELLED;
  } else {
    // Unknown status — log and skip (no state transition)
    console.warn(
      `[payment-worker] Unknown chargeStatus "${chargeStatus}" for chargeId ${chargeId}`,
    );
    return;
  }

  // 5. Atomic state transition
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: newPaymentStatus },
    }),
    prisma.campaign.update({
      where: { id: payment.campaignId },
      data: { status: newCampaignStatus },
    }),
  ]);

  // 6. Write audit log — intentionally after the transaction
  await prisma.paymentEvent.create({
    data: {
      chargeId,
      eventName: omiseEventKey,
      status: mapChargeStatusToEnum(chargeStatus),
      payload: job.data.rawPayload as Prisma.InputJsonValue,
    },
  });

  console.log(
    `[payment-worker] Processed chargeId ${chargeId}: payment=${newPaymentStatus}, campaign=${newCampaignStatus}`,
  );
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------

const worker = new Worker<PaymentEventJobData>(
  PAYMENT_EVENTS_QUEUE,
  processPaymentEvent,
  {
    connection: redis,
    concurrency: 1, // serial — payment state changes must not race
  },
);

worker.on("completed", (job) => {
  console.log(`[payment-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[payment-worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[payment-worker] Worker error:", err);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

async function shutdown() {
  console.log("[payment-worker] Shutting down...");
  await worker.close();
  await redis.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("[payment-worker] Started, listening on payment-events queue");
