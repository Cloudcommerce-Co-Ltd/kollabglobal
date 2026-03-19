import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../[chargeId]/status/route";

vi.mock("@/lib/omise", () => ({
  isOmiseConfigured: vi.fn(),
  retrieveCharge: vi.fn(),
}));

const makeRequest = (chargeId: string) => ({
  request: new Request(`http://localhost/api/payments/${chargeId}/status`),
  params: Promise.resolve({ chargeId }),
});

describe("GET /api/payments/[chargeId]/status", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(isOmiseConfigured).mockReturnValue(true);
  });

  it("returns 503 when Omise is not configured", async () => {
    const { isOmiseConfigured } = await import("@/lib/omise");
    vi.mocked(isOmiseConfigured).mockReturnValue(false);

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe("Payment service is not configured");
  });

  it("returns status, paid, amount on success", async () => {
    const { retrieveCharge } = await import("@/lib/omise");
    vi.mocked(retrieveCharge).mockResolvedValue({
      status: "successful",
      paid: true,
      amount: 100000,
    });

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "successful", paid: true, amount: 100000 });
  });

  it("returns 500 on error from retrieveCharge", async () => {
    const { retrieveCharge } = await import("@/lib/omise");
    vi.mocked(retrieveCharge).mockRejectedValue(new Error("Network error"));

    const { request, params } = makeRequest("chrg_test_123");
    const res = await GET(request, { params });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal server error");
  });
});
