import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isOmiseConfigured, retrieveCharge } from "@/lib/omise";

// How long a PENDING payment must be before we check Omise as a fallback.
// Avoids hammering the Omise API on every 3s poll immediately after charge creation.
const OMISE_FALLBACK_THRESHOLD_MS = 30_000; // 30 seconds

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
    const payment = await prisma.payment.findUnique({
      where: { omiseChargeId: chargeId },
      select: { status: true, amount: true, userId: true, campaignId: true, createdAt: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Don't reveal existence of payments belonging to other users
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Omise fallback — if the webhook was missed and the DB is still PENDING,
    // check Omise directly to get the real charge status.
    if (
      payment.status === "PENDING" &&
      isOmiseConfigured() &&
      Date.now() - payment.createdAt.getTime() > OMISE_FALLBACK_THRESHOLD_MS
    ) {
      try {
        const omiseCharge = await retrieveCharge(chargeId);

        if (omiseCharge.status === "successful") {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { omiseChargeId: chargeId },
              data: { status: "COMPLETED" },
            });
            await tx.campaign.update({
              where: { id: payment.campaignId },
              data: { status: "PENDING" },
            });
          });
          return NextResponse.json({ status: "successful", paid: true, amount: payment.amount });
        }

        if (omiseCharge.status === "failed" || omiseCharge.status === "expired") {
          await prisma.payment.update({
            where: { omiseChargeId: chargeId },
            data: { status: "FAILED" },
          });
          return NextResponse.json({ status: "failed", paid: false, amount: payment.amount });
        }
      } catch {
        // Omise call failed — fall through and return DB status
      }
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
