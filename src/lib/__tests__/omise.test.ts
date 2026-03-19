import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("omise", () => ({
  default: vi.fn(() => ({
    sources: {
      create: vi.fn().mockResolvedValue({ id: "src_test_123" }),
    },
    charges: {
      create: vi.fn().mockResolvedValue({
        id: "chrg_test_123",
        status: "pending",
        paid: false,
        amount: 100000,
        source: {
          scannable_code: {
            image: {
              download_uri: "https://example.com/qr.png",
            },
          },
        },
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: "chrg_test_123",
        status: "successful",
        paid: true,
        amount: 100000,
      }),
    },
  })),
}));

describe("omise lib", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe("isOmiseConfigured", () => {
    it("returns true when OMISE_SECRET_KEY is set", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      const { isOmiseConfigured } = await import("@/lib/omise");
      expect(isOmiseConfigured()).toBe(true);
    });

    it("returns false when OMISE_SECRET_KEY is not set", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "");
      const { isOmiseConfigured } = await import("@/lib/omise");
      expect(isOmiseConfigured()).toBe(false);
    });
  });

  describe("createPromptPayCharge", () => {
    it("throws when Omise is not configured", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "");
      const { createPromptPayCharge } = await import("@/lib/omise");
      await expect(createPromptPayCharge(100000)).rejects.toThrow(
        "Omise is not configured"
      );
    });

    it("calls omise SDK and returns charge data", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      const { createPromptPayCharge } = await import("@/lib/omise");
      const result = await createPromptPayCharge(100000);
      expect(result).toEqual({
        chargeId: "chrg_test_123",
        qrCodeUrl: "https://example.com/qr.png",
        amount: 100000,
        status: "pending",
      });
    });
  });

  describe("retrieveCharge", () => {
    it("throws when Omise is not configured", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "");
      const { retrieveCharge } = await import("@/lib/omise");
      await expect(retrieveCharge("chrg_test_123")).rejects.toThrow(
        "Omise is not configured"
      );
    });

    it("calls omise SDK and returns charge status", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      const { retrieveCharge } = await import("@/lib/omise");
      const result = await retrieveCharge("chrg_test_123");
      expect(result).toEqual({
        status: "successful",
        paid: true,
        amount: 100000,
      });
    });
  });
});
