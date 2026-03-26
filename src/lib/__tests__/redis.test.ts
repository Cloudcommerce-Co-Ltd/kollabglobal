import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ioredis to prevent real connections
vi.mock("ioredis", () => {
  class MockIORedis {
    on() {}
    quit() {}
  }
  return { default: MockIORedis };
});

describe("redis", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("isRedisConfigured() returns true when REDIS_URL is set", async () => {
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    const { isRedisConfigured } = await import("@/lib/redis");
    expect(isRedisConfigured()).toBe(true);
  });

  it("isRedisConfigured() returns false when REDIS_URL is empty", async () => {
    vi.stubEnv("REDIS_URL", "");
    const { isRedisConfigured } = await import("@/lib/redis");
    expect(isRedisConfigured()).toBe(false);
  });

  it("isRedisConfigured() returns false when REDIS_URL is not set", async () => {
    vi.stubEnv("REDIS_URL", undefined as unknown as string);
    const { isRedisConfigured } = await import("@/lib/redis");
    expect(isRedisConfigured()).toBe(false);
  });
});
