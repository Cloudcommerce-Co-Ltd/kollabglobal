import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Job } from "bullmq";
import type { PaymentEventJobData } from "@/lib/queue/payment-queue";

// ---------------------------------------------------------------------------
// Hoisted mocks — vi.hoisted runs before vi.mock factories, so we can share
// mock functions between the factory and the test body.
// ---------------------------------------------------------------------------

const {
  mockPaymentFindFirst,
  mockPaymentUpdate,
  mockCampaignUpdate,
  mockPaymentEventCreate,
  mockTransaction,
  capturedProcessorHolder,
} = vi.hoisted(() => {
  return {
    mockPaymentFindFirst: vi.fn(),
    mockPaymentUpdate: vi.fn(),
    mockCampaignUpdate: vi.fn(),
    mockPaymentEventCreate: vi.fn(),
    mockTransaction: vi.fn(),
    // Use an object to hold the captured processor so we can mutate it from inside vi.mock
    capturedProcessorHolder: { processor: null as ((job: Job<PaymentEventJobData>) => Promise<void>) | null },
  };
});

// Mock BullMQ — must include both Worker and Queue since payment-queue.ts also imports Queue
// Both must use class/function syntax (not arrow functions) to support `new`
vi.mock("bullmq", () => {
  // Queue mock — needs class/function syntax for `new`
  function MockQueue(this: object) {}
  MockQueue.prototype.add = vi.fn();

  // Worker mock — captures the processor function using a proper constructor function
  function MockWorker(
    this: object,
    _name: string,
    processor: (job: Job) => Promise<void>,
  ) {
    capturedProcessorHolder.processor = processor;
  }
  MockWorker.prototype.on = vi.fn();
  MockWorker.prototype.close = vi.fn();

  return {
    Worker: MockWorker,
    Queue: MockQueue,
  };
});

// Mock the redis module directly (so payment-queue and worker both get the same mock)
vi.mock("@/lib/redis", () => ({
  default: {
    on: vi.fn(),
    quit: vi.fn(),
  },
  isRedisConfigured: vi.fn().mockReturnValue(false),
}));

// Also mock ioredis itself in case it's instantiated before the module alias resolves
vi.mock("ioredis", () => {
  class MockIORedis {
    on() {}
    quit() {}
  }
  return { default: MockIORedis };
});

vi.mock("@/lib/prisma", () => ({
  default: {
    payment: {
      findFirst: mockPaymentFindFirst,
      update: mockPaymentUpdate,
    },
    campaign: {
      update: mockCampaignUpdate,
    },
    paymentEvent: {
      create: mockPaymentEventCreate,
    },
    $transaction: mockTransaction,
    $disconnect: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Import the worker AFTER all mocks are set up — this triggers Worker construction
// ---------------------------------------------------------------------------
import "@/workers/payment-worker";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJob(data: Partial<PaymentEventJobData> & { chargeId: string }): Job<PaymentEventJobData> {
  return {
    id: "test-job-1",
    data: {
      chargeId: data.chargeId,
      chargeStatus: data.chargeStatus ?? "successful",
      omiseEventKey: data.omiseEventKey ?? "charge.complete",
      receivedAt: data.receivedAt ?? Date.now(),
      rawPayload: data.rawPayload ?? { key: "charge.complete", data: { id: data.chargeId } },
    },
  } as Job<PaymentEventJobData>;
}

const mockPayment = {
  id: "payment_1",
  campaignId: "campaign_1",
  omiseChargeId: "chrg_test_123",
  amount: 100000,
  currency: "THB",
  method: "QR_CODE",
  status: "PENDING",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("payment-worker processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("completes silently when no payment is found for chargeId", async () => {
    mockPaymentFindFirst.mockResolvedValue(null);

    const job = makeJob({ chargeId: "chrg_unknown" });
    await capturedProcessorHolder.processor!(job);

    expect(mockPaymentFindFirst).toHaveBeenCalledWith({
      where: { omiseChargeId: "chrg_unknown" },
    });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("skips processing when payment status is already COMPLETED (state guard)", async () => {
    mockPaymentFindFirst.mockResolvedValue({ ...mockPayment, status: "COMPLETED" });

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "successful" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("skips processing when payment status is already FAILED (state guard)", async () => {
    mockPaymentFindFirst.mockResolvedValue({ ...mockPayment, status: "FAILED" });

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "failed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("transitions payment to COMPLETED and campaign to PENDING on chargeStatus: successful", async () => {
    mockPaymentFindFirst.mockResolvedValue(mockPayment);
    mockTransaction.mockResolvedValue([{}, {}]);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "successful" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // The transaction is called with an array of two prisma operations
    const transactionArgs = (mockTransaction as Mock).mock.calls[0][0] as unknown[];
    expect(transactionArgs).toHaveLength(2);

    // Also verify audit log written after transaction
    expect(mockPaymentEventCreate).toHaveBeenCalledTimes(1);
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        eventName: "charge.complete",
        status: "SUCCESSFUL",
      }),
    });
  });

  it("transitions payment to FAILED and campaign to CANCELLED on chargeStatus: failed", async () => {
    mockPaymentFindFirst.mockResolvedValue(mockPayment);
    mockTransaction.mockResolvedValue([{}, {}]);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "failed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        status: "FAILED",
      }),
    });
  });

  it("transitions payment to FAILED and campaign to CANCELLED on chargeStatus: expired", async () => {
    mockPaymentFindFirst.mockResolvedValue(mockPayment);
    mockTransaction.mockResolvedValue([{}, {}]);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "expired" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        status: "EXPIRED",
      }),
    });
  });

  it("does NOT call $transaction on chargeStatus: reversed, but DOES write audit PaymentEvent", async () => {
    mockPaymentFindFirst.mockResolvedValue(mockPayment);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "reversed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).toHaveBeenCalledTimes(1);
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        eventName: "charge.complete",
        status: "REVERSED",
      }),
    });
  });

  it("does NOT call $transaction on unknown chargeStatus, but DOES write audit PaymentEvent", async () => {
    mockPaymentFindFirst.mockResolvedValue(mockPayment);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "unknown" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).toHaveBeenCalledTimes(1);
    // unknown maps to FAILED in mapChargeStatusToEnum
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        status: "FAILED",
      }),
    });
  });

  it("writes PaymentEvent audit row with correct chargeId, eventName, status, and payload", async () => {
    mockPaymentFindFirst.mockResolvedValue(mockPayment);
    mockTransaction.mockResolvedValue([{}, {}]);
    mockPaymentEventCreate.mockResolvedValue({});

    const rawPayload = { key: "charge.complete", data: { id: "chrg_test_123", status: "successful" } };
    const job = makeJob({
      chargeId: "chrg_test_123",
      chargeStatus: "successful",
      omiseEventKey: "charge.complete",
      rawPayload,
    });
    await capturedProcessorHolder.processor!(job);

    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: {
        chargeId: "chrg_test_123",
        eventName: "charge.complete",
        status: "SUCCESSFUL",
        payload: rawPayload,
      },
    });
  });
});
