import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isOmiseConfigured, createPromptPayCharge } from "@/lib/omise";
import {
  PromotionType,
  CampaignStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";

const createChargeSchema = z.object({
  amount: z.number().int().positive(),
  countryId: z.string().min(1),
  packageId: z.string().min(1),
  promotionType: z.enum(["PRODUCT", "SERVICE"]),
  creatorIds: z.array(z.string().min(1)),
});

export async function POST(request: Request) {
  // 1. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = createChargeSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation error", details: parseResult.error.issues },
      { status: 400 }
    );
  }

  const { amount, countryId, packageId, promotionType, creatorIds } =
    parseResult.data;

  // 2. Check Omise configuration
  if (!isOmiseConfigured()) {
    return NextResponse.json(
      { error: "Payment service is not configured" },
      { status: 503 }
    );
  }

  // 3. Get session
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 4. Look up user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 5. Create Campaign, CampaignProduct, and CampaignCreators in a transaction
    const { campaign } = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.create({
        data: {
          userId: user.id,
          countryId,
          packageId,
          promotionType: promotionType as PromotionType,
          status: CampaignStatus.PENDING_PAYMENT,
        },
      });

      await tx.campaignProduct.create({
        data: {
          campaignId: campaign.id,
          brandName: "POC Brand",
          productName: "POC Product",
          category: "general",
          description: "POC description",
          sellingPoints: "POC selling points",
          isService: false,
        },
      });

      await tx.campaignCreator.createMany({
        data: creatorIds.map((creatorId) => ({
          campaignId: campaign.id,
          creatorId,
        })),
      });

      return { campaign };
    });

    // 6. Create Omise PromptPay charge
    const charge = await createPromptPayCharge(amount);

    // 7. Create Payment record
    const payment = await prisma.payment.create({
      data: {
        campaignId: campaign.id,
        amount,
        currency: "THB",
        method: PaymentMethod.QR_CODE,
        status: PaymentStatus.PENDING,
        omiseChargeId: charge.chargeId,
      },
    });

    // 8. Return response
    return NextResponse.json({
      chargeId: charge.chargeId,
      qrCodeUrl: charge.qrCodeUrl,
      paymentId: payment.id,
      campaignId: campaign.id,
    });
  } catch (error) {
    console.error("[POST /api/payments/create-charge] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
