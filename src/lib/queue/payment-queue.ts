// BullMQ queue for payment events. Webhook handler enqueues here;
// the payment worker consumes and processes events.
import { Queue } from "bullmq";
import redis from "@/lib/redis";

export const PAYMENT_EVENTS_QUEUE = "payment-events";

export type OmiseChargeStatus = "successful" | "failed" | "expired" | "reversed" | "unknown";

export type PaymentEventJobData = {
  chargeId: string;
  chargeStatus: OmiseChargeStatus; // raw Omise charge status
  omiseEventKey: string;           // e.g. "charge.complete"
  receivedAt: number;              // unix timestamp ms
  rawPayload: Record<string, unknown>;
};

export const paymentQueue = new Queue<PaymentEventJobData>(PAYMENT_EVENTS_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000, // 1s, 2s, 4s, 8s, 16s
    },
    removeOnComplete: { age: 7 * 24 * 3600 }, // keep 7 days
    removeOnFail: { count: 1000 },             // keep last 1000 failed
  },
});
