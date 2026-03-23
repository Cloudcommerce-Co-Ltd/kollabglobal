import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, CampaignStatus } from "@/generated/prisma/client";

function verifySignature(rawBody: string, timestamp: string | null, signature: string | null): boolean {
  const secret = process.env.OMISE_WEBHOOK_SECRET;

  if (!secret || !signature || !timestamp) return false;

  const secretBytes = Buffer.from(secret, "base64");
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedPayload).digest("hex");

  // Header may contain multiple comma-separated signatures during secret rotation
  return signature.split(",").some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig.trim()), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("omise-signature");
  const timestamp = request.headers.get("omise-signature-timestamp");

  if (!verifySignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Reject replayed webhooks older than 5 minutes
  const MAX_WEBHOOK_AGE_SECONDS = 300;
  if (timestamp && Date.now() / 1000 - parseInt(timestamp, 10) > MAX_WEBHOOK_AGE_SECONDS) {
    return NextResponse.json({ error: "Webhook too old" }, { status: 401 });
  }

  let event: { key?: string; data?: { id?: string; status?: string } };
  try {
    event = JSON.parse(rawBody);
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

  // State guard — only transition PENDING payments; ignore replayed/out-of-order events
  if (payment.status !== PaymentStatus.PENDING) {
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
        data: { status: CampaignStatus.PENDING },
      }),
    ]);
  } else if (chargeStatus === "failed" || chargeStatus === "expired") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      }),
      prisma.campaign.update({
        where: { id: payment.campaignId },
        data: { status: CampaignStatus.CANCELLED },
      }),
    ]);
  }
  // Any other status — no-op

  return NextResponse.json({ received: true });
}
