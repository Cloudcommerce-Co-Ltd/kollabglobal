import { describe, it, expect, vi, afterEach } from "vitest";

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
        created_at: "2026-03-27T07:00:52.559Z",
        source: {
          scannable_code: {
            image: {
              download_uri: "https://example.com/qr-retrieved.png",
            },
          },
        },
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

    it("sets expires_at to 15 minutes in the future", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      const before = Date.now();
      const OmiseMock = (await import("omise")).default as unknown as ReturnType<typeof vi.fn>;
      const chargesCreate = vi.fn().mockResolvedValue({
        id: "chrg_test_123",
        status: "pending",
        paid: false,
        amount: 100000,
        source: { scannable_code: { image: { download_uri: "https://example.com/qr.png" } } },
      });
      OmiseMock.mockReturnValueOnce({
        sources: { create: vi.fn().mockResolvedValue({ id: "src_test_123" }) },
        charges: { create: chargesCreate },
      });
      const { createPromptPayCharge } = await import("@/lib/omise");
      await createPromptPayCharge(100000);
      const after = Date.now();
      const calledWith = chargesCreate.mock.calls[0][0];
      const expiresAt = new Date(calledWith.expires_at).getTime();
      const ttlMs = parseInt(process.env.OMISE_CHARGE_EXPIRED_DURATION ?? '15', 10) * 60 * 1000;
      expect(expiresAt).toBeGreaterThanOrEqual(before + ttlMs);
      expect(expiresAt).toBeLessThanOrEqual(after + ttlMs);
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

    it("calls omise SDK and returns charge status with qrCodeUrl", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      const { retrieveCharge } = await import("@/lib/omise");
      const result = await retrieveCharge("chrg_test_123");
      expect(result).toEqual({
        status: "successful",
        paid: true,
        amount: 100000,
        qrCodeUrl: "https://example.com/qr-retrieved.png",
        createdAt: "2026-03-27T07:00:52.559Z",
      });
    });

    it("returns empty qrCodeUrl when scannable_code is missing", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      // Override the mock temporarily
      const OmiseMock = (await import("omise")).default as unknown as ReturnType<typeof vi.fn>;
      OmiseMock.mockReturnValueOnce({
        sources: { create: vi.fn() },
        charges: {
          create: vi.fn(),
          retrieve: vi.fn().mockResolvedValue({
            id: "chrg_no_qr",
            status: "pending",
            paid: false,
            amount: 50000,
          }),
        },
      });
      const { retrieveCharge } = await import("@/lib/omise");
      const result = await retrieveCharge("chrg_no_qr");
      expect(result.qrCodeUrl).toBe("");
    });
  });

  describe("expireCharge", () => {
    it("throws when Omise is not configured", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "");
      const { expireCharge } = await import("@/lib/omise");
      await expect(expireCharge("chrg_test")).rejects.toThrow("Omise is not configured");
    });

    it("calls omise charges.expire with the charge ID", async () => {
      vi.stubEnv("OMISE_SECRET_KEY", "test_key");
      const OmiseMock = (await import("omise")).default as unknown as ReturnType<typeof vi.fn>;
      const expireFn = vi.fn().mockResolvedValue({});
      OmiseMock.mockReturnValueOnce({
        sources: { create: vi.fn() },
        charges: { expire: expireFn },
      });
      const { expireCharge } = await import("@/lib/omise");
      await expireCharge("chrg_abc");
      expect(expireFn).toHaveBeenCalledWith("chrg_abc");
    });
  });
});
