import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Job } from "bullmq";
import type { PaymentEventJobData } from "@/lib/queue/payment-queue";

// ---------------------------------------------------------------------------
// Hoisted mocks — vi.hoisted runs before vi.mock factories, so we can share
// mock functions between the factory and the test body.
// ---------------------------------------------------------------------------

const {
  mockPaymentFindUnique,
  mockPaymentUpdate,
  mockCampaignUpdate,
  mockPaymentEventCreate,
  mockCampaignStatusLogCreate,
  mockTransaction,
  capturedProcessorHolder,
} = vi.hoisted(() => {
  return {
    mockPaymentFindUnique: vi.fn(),
    mockPaymentUpdate: vi.fn(),
    mockCampaignUpdate: vi.fn(),
    mockPaymentEventCreate: vi.fn(),
    mockCampaignStatusLogCreate: vi.fn(),
    mockTransaction: vi.fn(),
    // Use an object to hold the captured processor so we can mutate it from inside vi.mock
    capturedProcessorHolder: { processor: null as ((job: Job<PaymentEventJobData>) => Promise<void>) | null },
  };
});

// txMock is passed to the interactive $transaction callback so that
// tx.payment.update / tx.campaign.update / tx.paymentEvent.create hit our mocks.
const txMock = {
  payment: { update: mockPaymentUpdate },
  campaign: { update: mockCampaignUpdate },
  campaignStatusLog: { create: mockCampaignStatusLogCreate },
  paymentEvent: { create: mockPaymentEventCreate },
};

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
      findUnique: mockPaymentFindUnique,
      update: mockPaymentUpdate,
    },
    campaign: {
      update: mockCampaignUpdate,
    },
    campaignStatusLog: {
      create: mockCampaignStatusLogCreate,
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
    // Default: $transaction invokes the callback with txMock (interactive transaction style).
    // Individual tests that need to simulate a transaction failure override with mockRejectedValue.
    mockTransaction.mockImplementation(async (fn: (tx: typeof txMock) => Promise<void>) => fn(txMock));
    mockCampaignStatusLogCreate.mockResolvedValue({});
  });

  it("completes silently when no payment is found for chargeId", async () => {
    mockPaymentFindUnique.mockResolvedValue(null);

    const job = makeJob({ chargeId: "chrg_unknown" });
    await capturedProcessorHolder.processor!(job);

    expect(mockPaymentFindUnique).toHaveBeenCalledWith({
      where: { omiseChargeId: "chrg_unknown" },
    });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("skips processing when payment status is already COMPLETED and chargeStatus is not reversed (state guard)", async () => {
    mockPaymentFindUnique.mockResolvedValue({ ...mockPayment, status: "COMPLETED" });

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "successful" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("skips processing when payment status is already FAILED (state guard)", async () => {
    mockPaymentFindUnique.mockResolvedValue({ ...mockPayment, status: "FAILED" });

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "failed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("transitions payment to COMPLETED and campaign to PENDING on chargeStatus: successful", async () => {
    mockPaymentFindUnique.mockResolvedValue(mockPayment);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "successful" });
    await capturedProcessorHolder.processor!(job);

    expect(mockPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "payment_1" },
      data: { status: "COMPLETED" },
    });
    expect(mockCampaignUpdate).toHaveBeenCalledWith({
      where: { id: "campaign_1" },
      data: { status: "PENDING" },
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    // Audit log written atomically inside the transaction
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
    mockPaymentFindUnique.mockResolvedValue(mockPayment);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "failed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "payment_1" },
      data: { status: "FAILED" },
    });
    expect(mockCampaignUpdate).toHaveBeenCalledWith({
      where: { id: "campaign_1" },
      data: { status: "CANCELLED" },
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        status: "FAILED",
      }),
    });
  });

  it("transitions payment to FAILED and campaign to CANCELLED on chargeStatus: expired", async () => {
    mockPaymentFindUnique.mockResolvedValue(mockPayment);
    mockPaymentEventCreate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "expired" });
    await capturedProcessorHolder.processor!(job);

    expect(mockPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "payment_1" },
      data: { status: "FAILED" },
    });
    expect(mockCampaignUpdate).toHaveBeenCalledWith({
      where: { id: "campaign_1" },
      data: { status: "CANCELLED" },
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        status: "EXPIRED",
      }),
    });
  });

  it("re-throws when $transaction fails, allowing BullMQ to retry the job", async () => {
    mockPaymentFindUnique.mockResolvedValue(mockPayment);
    // Override the default implementation — $transaction rejects without invoking the callback
    mockTransaction.mockRejectedValue(new Error("DB connection lost"));

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "successful" });
    await expect(capturedProcessorHolder.processor!(job)).rejects.toThrow("DB connection lost");

    // Since the callback was never invoked, the audit log must NOT be written
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });

  it("does NOT call $transaction on PENDING chargeStatus: reversed, but DOES write audit PaymentEvent", async () => {
    mockPaymentFindUnique.mockResolvedValue(mockPayment); // status: PENDING
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
    mockPaymentFindUnique.mockResolvedValue(mockPayment);
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
    mockPaymentFindUnique.mockResolvedValue(mockPayment);
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

  // Fix 3: COMPLETED → REFUNDED on reversed charge
  it("transitions COMPLETED payment to REFUNDED atomically with audit log on chargeStatus: reversed", async () => {
    mockPaymentFindUnique.mockResolvedValue({ ...mockPayment, status: "COMPLETED" });
    mockPaymentEventCreate.mockResolvedValue({});
    mockPaymentUpdate.mockResolvedValue({});

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "reversed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockPaymentUpdate).toHaveBeenCalledWith({
      where: { id: "payment_1" },
      data: { status: "REFUNDED" },
    });
    // Campaign status is NOT changed — CampaignStatus has no REFUNDED state
    expect(mockCampaignUpdate).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        chargeId: "chrg_test_123",
        status: "REVERSED",
      }),
    });
  });

  it("skips REFUNDED transition when payment is REFUNDED and chargeStatus is reversed (idempotent)", async () => {
    mockPaymentFindUnique.mockResolvedValue({ ...mockPayment, status: "REFUNDED" });

    const job = makeJob({ chargeId: "chrg_test_123", chargeStatus: "reversed" });
    await capturedProcessorHolder.processor!(job);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockPaymentEventCreate).not.toHaveBeenCalled();
  });
});
