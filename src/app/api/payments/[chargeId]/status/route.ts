import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Map DB PaymentStatus to the Omise status strings the frontend polls for
function toOmiseStatus(dbStatus: string): string {
  if (dbStatus === "COMPLETED") return "successful";
  if (dbStatus === "FAILED") return "failed";
  return "pending";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chargeId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chargeId } = await params;

  try {
    const payment = await prisma.payment.findFirst({
      where: { omiseChargeId: chargeId },
      select: { status: true, amount: true, userId: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Don't reveal existence of payments belonging to other users
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: toOmiseStatus(payment.status),
      paid: payment.status === "COMPLETED",
      amount: payment.amount,
    });
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
