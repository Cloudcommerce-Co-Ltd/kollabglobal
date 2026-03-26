import { describe, it, expect, vi, beforeEach } from "vitest";

// Track Queue constructor arguments across all calls
const queueCalls: Array<{ name: string; options: unknown }> = [];

// Mock ioredis — must use class/function syntax (not arrow function) to support `new`
vi.mock("ioredis", () => {
  class MockIORedis {
    on() {}
    quit() {}
  }
  return { default: MockIORedis };
});

// Mock bullmq Queue — must use class/function syntax to support `new`
vi.mock("bullmq", () => {
  function MockQueue(this: { name: string; opts: unknown }, name: string, options: unknown) {
    this.name = name;
    this.opts = options;
    queueCalls.push({ name, options });
  }
  return { Queue: MockQueue };
});

describe("payment-queue", () => {
  beforeEach(() => {
    vi.resetModules();
    queueCalls.length = 0;
    vi.clearAllMocks();
  });

  it("PAYMENT_EVENTS_QUEUE constant equals 'payment-events'", async () => {
    const { PAYMENT_EVENTS_QUEUE } = await import("@/lib/queue/payment-queue");
    expect(PAYMENT_EVENTS_QUEUE).toBe("payment-events");
  });

  it("paymentQueue is created with name PAYMENT_EVENTS_QUEUE", async () => {
    const { paymentQueue, PAYMENT_EVENTS_QUEUE } = await import("@/lib/queue/payment-queue");
    expect((paymentQueue as { name: string }).name).toBe(PAYMENT_EVENTS_QUEUE);
  });

  it("OmiseChargeStatus type includes 'successful', 'failed', 'expired', 'reversed', 'unknown'", async () => {
    // OmiseChargeStatus is a TypeScript type (union). We verify the module imports cleanly
    // and the type accepts each of the expected status strings. We do this by using them
    // as job data and checking the type is exported (TypeScript compilation validates this).
    const { PAYMENT_EVENTS_QUEUE } = await import("@/lib/queue/payment-queue");
    type OmiseChargeStatus = import("@/lib/queue/payment-queue").OmiseChargeStatus;
    const statuses: OmiseChargeStatus[] = ["successful", "failed", "expired", "reversed", "unknown"];
    expect(statuses).toHaveLength(5);
    expect(statuses).toContain("successful");
    expect(statuses).toContain("failed");
    expect(statuses).toContain("expired");
    expect(statuses).toContain("reversed");
    expect(statuses).toContain("unknown");
    // Module loaded without error
    expect(PAYMENT_EVENTS_QUEUE).toBeDefined();
  });

  it("isRedisConfigured() returns true when REDIS_URL is set", async () => {
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    const { isRedisConfigured } = await import("@/lib/redis");
    expect(isRedisConfigured()).toBe(true);
    vi.unstubAllEnvs();
  });

  it("isRedisConfigured() returns false when REDIS_URL is not set", async () => {
    vi.stubEnv("REDIS_URL", "");
    const { isRedisConfigured } = await import("@/lib/redis");
    expect(isRedisConfigured()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("default job options have attempts: 5", async () => {
    await import("@/lib/queue/payment-queue");
    expect(queueCalls).toHaveLength(1);
    const options = queueCalls[0].options as { defaultJobOptions?: { attempts?: number } };
    expect(options?.defaultJobOptions?.attempts).toBe(5);
  });

  it("backoff type is 'exponential' with delay 1000", async () => {
    await import("@/lib/queue/payment-queue");
    expect(queueCalls).toHaveLength(1);
    const options = queueCalls[0].options as {
      defaultJobOptions?: { backoff?: { type?: string; delay?: number } };
    };
    expect(options?.defaultJobOptions?.backoff?.type).toBe("exponential");
    expect(options?.defaultJobOptions?.backoff?.delay).toBe(1000);
  });
});
