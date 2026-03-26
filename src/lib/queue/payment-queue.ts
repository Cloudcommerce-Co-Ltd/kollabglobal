import { Queue } from "bullmq";
import redis from "@/lib/redis";

export type PaymentEventJobData = {
  chargeId: string;
  chargeStatus: string; // raw Omise status: "successful" | "failed" | "expired"
  omiseEventKey: string; // e.g. "charge.complete"
  receivedAt: number; // unix timestamp ms
  rawPayload: Record<string, unknown>;
};

export const paymentQueue = new Queue<PaymentEventJobData>("payment-events", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000, // 1s, 2s, 4s, 8s, 16s
    },
    removeOnComplete: { age: 7 * 24 * 3600 }, // keep 7 days
    removeOnFail: { count: 1000 }, // keep last 1000 failed
  },
});
