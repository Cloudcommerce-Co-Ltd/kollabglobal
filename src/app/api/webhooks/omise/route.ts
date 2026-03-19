// TODO: verify HMAC-SHA256 signature from X-Omise-Signature header

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, CampaignStatus } from "@/generated/prisma/client";

export async function POST(request: Request) {
  let event: { key?: string; data?: { id?: string; status?: string } };

  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Ignore non-charge.complete events
  if (event.key !== "charge.complete") {
    return NextResponse.json({ received: true });
  }

  const chargeId = event.data?.id;
  const chargeStatus = event.data?.status;

  if (!chargeId) {
    return NextResponse.json({ received: true });
  }

  const payment = await prisma.payment.findFirst({
    where: { omiseChargeId: chargeId },
  });

  // Idempotent — no payment record means nothing to update
  if (!payment) {
    return NextResponse.json({ received: true });
  }

  if (chargeStatus === "successful") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      }),
      prisma.campaign.update({
        where: { id: payment.campaignId },
        data: { status: CampaignStatus.ACTIVE },
      }),
    ]);
  } else if (chargeStatus === "failed" || chargeStatus === "expired") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
  }
  // Any other status — no-op

  return NextResponse.json({ received: true });
}
