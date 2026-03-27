import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isOmiseConfigured, retrieveCharge, createPromptPayCharge } from "@/lib/omise";
import { calculateTotalWithFees } from "@/lib/package-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { campaignId } = await params;

  // Load campaign + payment — must be owned by the authenticated user
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId: session.user.id },
    include: {
      package: true,
      products: true,
      creators: { include: { creator: true } },
      payment: true,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "AWAITING_PAYMENT") {
    return NextResponse.json({ error: "Campaign is not awaiting payment" }, { status: 409 });
  }

  if (!isOmiseConfigured()) {
    return NextResponse.json({ error: "Payment service is not configured" }, { status: 503 });
  }

  const payment = campaign.payment;
  const { totalSatang } = calculateTotalWithFees(campaign.package!);

  let chargeId: string;
  let qrCodeUrl: string;

  if (payment?.omiseChargeId) {
    // Try to reuse the existing charge
    try {
      const existing = await retrieveCharge(payment.omiseChargeId);
      if (existing.status === "pending") {
        chargeId = payment.omiseChargeId;
        qrCodeUrl = existing.qrCodeUrl;
      } else {
        // Charge is expired or failed — create a fresh one
        const fresh = await createPromptPayCharge(totalSatang);
        await prisma.payment.update({
          where: { id: payment.id },
          data: { omiseChargeId: fresh.chargeId },
        });
        chargeId = fresh.chargeId;
        qrCodeUrl = fresh.qrCodeUrl;
      }
    } catch {
      // Charge not found in Omise — create a fresh one
      const fresh = await createPromptPayCharge(totalSatang);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { omiseChargeId: fresh.chargeId },
      });
      chargeId = fresh.chargeId;
      qrCodeUrl = fresh.qrCodeUrl;
    }
  } else {
    // No charge yet — create one
    const fresh = await createPromptPayCharge(totalSatang);
    await prisma.payment.update({
      where: { id: payment!.id },
      data: { omiseChargeId: fresh.chargeId },
    });
    chargeId = fresh.chargeId;
    qrCodeUrl = fresh.qrCodeUrl;
  }

  return NextResponse.json({
    campaignId: campaign.id,
    chargeId,
    qrCodeUrl,
    package: {
      name: campaign.package?.name,
      numCreators: campaign.package?.numCreators,
      price: campaign.package?.price,
      deliverables: campaign.package?.deliverables,
    },
    product: {
      brandName: campaign.products?.[0]?.brandName,
      productName: campaign.products?.[0]?.productName,
      isService: campaign.products?.[0]?.isService,
      category: campaign.products?.[0]?.category,
    },
    creators: campaign.creators.map((cc) => ({
      id: cc.creator.id,
      name: cc.creator.name,
      avatar: cc.creator.avatar,
    })),
  });
}
