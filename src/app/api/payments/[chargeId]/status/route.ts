import { NextResponse } from "next/server";
import { isOmiseConfigured, retrieveCharge } from "@/lib/omise";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chargeId: string }> }
) {
  const { chargeId } = await params;

  if (!isOmiseConfigured()) {
    return NextResponse.json(
      { error: "Payment service is not configured" },
      { status: 503 }
    );
  }

  try {
    const { status, paid, amount } = await retrieveCharge(chargeId);
    return NextResponse.json({ status, paid, amount });
  } catch (error) {
    console.error(
      `[GET /api/payments/${chargeId}/status] Unexpected error:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
