import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Job } from "bullmq";
import type { PaymentEventJobData } from "@/lib/queue/payment-queue";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const {
  mockDlqAdd,
  capturedOnHandlers,
  capturedProcessorHolder,
  mockPaymentFindUnique,
  mockTransaction,
} = vi.hoisted(() => ({
  mockDlqAdd: vi.fn(),
  // Handlers registered via worker.on(event, handler) are captured here
  capturedOnHandlers: {} as Record<string, (...args: unknown[]) => unknown>,
  capturedProcessorHolder: {
    processor: null as ((job: Job<PaymentEventJobData>) => Promise<void>) | null,
  },
  mockPaymentFindUnique: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("bullmq", () => {
  function MockQueue(this: object) {}
  MockQueue.prototype.add = vi.fn();

  function MockWorker(
    this: object,
    _name: string,
    processor: (job: Job<PaymentEventJobData>) => Promise<void>,
  ) {
    capturedProcessorHolder.processor = processor;
  }
  MockWorker.prototype.on = vi
    .fn()
    .mockImplementation(function (_event: string, handler: (...args: unknown[]) => unknown) {
      capturedOnHandlers[_event] = handler;
    });
  MockWorker.prototype.close = vi.fn();

  return { Worker: MockWorker, Queue: MockQueue };
});

vi.mock("@/lib/redis", () => ({
  default: { on: vi.fn(), quit: vi.fn() },
  isRedisConfigured: vi.fn().mockReturnValue(false),
}));

vi.mock("ioredis", () => {
  class MockIORedis {
    on() {}
    quit() {}
  }
  return { default: MockIORedis };
});

vi.mock("@/lib/prisma", () => ({
  default: {
    payment: { findUnique: mockPaymentFindUnique, update: vi.fn() },
    campaign: { update: vi.fn() },
    paymentEvent: { create: vi.fn() },
    $transaction: mockTransaction,
    $disconnect: vi.fn(),
  },
}));

vi.mock("@/lib/queue/dead-letter-queue", () => ({
  paymentDlq: { add: mockDlqAdd },
  PAYMENT_DLQ_NAME: "payment-events-dlq",
}));

// Import the worker AFTER all mocks — triggers Worker construction and registers handlers
import "@/workers/payment-worker";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFailedJob(
  overrides: Partial<{
    id: string;
    attemptsMade: number;
    maxAttempts: number;
    chargeId: string;
    omiseEventKey: string;
  }> = {}
) {
  const {
    id = "job-1",
    attemptsMade = 5,
    maxAttempts = 5,
    chargeId = "chrg_abc",
    omiseEventKey = "charge.complete",
  } = overrides;

  return {
    id,
    attemptsMade,
    opts: { attempts: maxAttempts },
    data: {
      chargeId,
      chargeStatus: "failed",
      omiseEventKey,
      receivedAt: 1000,
      rawPayload: {},
    },
  } as unknown as Job<PaymentEventJobData>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("payment-worker DLQ handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enqueues to DLQ on the final attempt (attemptsMade === maxAttempts)", async () => {
    const job = makeFailedJob({ attemptsMade: 5, maxAttempts: 5 });
    const err = new Error("DB timeout");

    const failedHandler = capturedOnHandlers["failed"];
    expect(failedHandler).toBeDefined();

    await failedHandler(job, err);

    expect(mockDlqAdd).toHaveBeenCalledTimes(1);
    expect(mockDlqAdd).toHaveBeenCalledWith(
      "dead-letter",
      expect.objectContaining({
        chargeId: "chrg_abc",
        omiseEventKey: "charge.complete",
        originalJobId: "job-1",
        failureReason: "DB timeout",
        attemptsMade: 5,
        failedAt: expect.any(Number),
      })
    );
  });

  it("does NOT enqueue to DLQ on intermediate attempts (attemptsMade < maxAttempts)", async () => {
    const failedHandler = capturedOnHandlers["failed"];

    for (const attemptsMade of [1, 2, 3, 4]) {
      const job = makeFailedJob({ attemptsMade, maxAttempts: 5 });
      await failedHandler(job, new Error("transient error"));
    }

    expect(mockDlqAdd).not.toHaveBeenCalled();
  });

  it("emits structured JSON log on final failure", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const job = makeFailedJob({ attemptsMade: 5, maxAttempts: 5, chargeId: "chrg_xyz" });
    const err = new Error("final failure");

    await capturedOnHandlers["failed"](job, err);

    const logCall = consoleSpy.mock.calls.find((args) => {
      try {
        const parsed = JSON.parse(args[0] as string);
        return parsed.event === "payment_dlq";
      } catch {
        return false;
      }
    });

    expect(logCall).toBeDefined();
    const logEntry = JSON.parse(logCall![0] as string);
    expect(logEntry).toMatchObject({
      level: "error",
      event: "payment_dlq",
      chargeId: "chrg_xyz",
      failureReason: "final failure",
      attemptsMade: 5,
    });

    consoleSpy.mockRestore();
  });

  it("does nothing when job is null/undefined", async () => {
    const failedHandler = capturedOnHandlers["failed"];
    await failedHandler(undefined, new Error("orphan error"));
    expect(mockDlqAdd).not.toHaveBeenCalled();
  });
});
