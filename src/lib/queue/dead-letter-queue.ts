// Dead letter queue for payment events that have exhausted all retry attempts.
// Jobs land here for manual inspection and replay.
import { Queue } from "bullmq";
import redis from "@/lib/redis";
import type { PaymentEventJobData } from "./payment-queue";

export const PAYMENT_DLQ_NAME = "payment-events-dlq";

export type DeadLetterJobData = PaymentEventJobData & {
  originalJobId: string;
  failureReason: string;
  attemptsMade: number;
  failedAt: number; // unix timestamp ms
};

export const paymentDlq = new Queue<DeadLetterJobData>(PAYMENT_DLQ_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: false,
    removeOnFail: false,
  },
});
