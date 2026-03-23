import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isOmiseConfigured, createPromptPayCharge, retrieveCharge } from "@/lib/omise";
import { calculateTotalWithFees } from "@/lib/package-utils";
import {
  PromotionType,
  CampaignStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";

const createChargeSchema = z.object({
  countryId: z.number().int().positive(),
  packageId: z.number().int().positive(),
  promotionType: z.enum(["PRODUCT", "SERVICE"]),
  creatorIds: z.array(z.string().min(1)),
  productData: z.object({
    brandName: z.string().min(1),
    productName: z.string().min(1),
    category: z.string().min(1),
    description: z.string(),
    sellingPoints: z.string(),
    url: z.string().optional(),
    imageUrl: z.string().optional(),
    isService: z.boolean(),
    weight: z.number().nullable().optional(),
    length: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
  }),
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

  const { countryId, packageId, promotionType, creatorIds, productData } =
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 4. Look up package and compute amount server-side — never trust client amount
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 400 });
    }
    const { basePrice, vat, serviceFee, total, totalSatang } = calculateTotalWithFees(pkg);

    // 6. Idempotency — return existing pending charge if one already exists
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        userId: userId,
        packageId,
        countryId,
        status: CampaignStatus.AWAITING_PAYMENT,
      },
      include: { payment: true },
    });

    if (existingCampaign?.payment?.omiseChargeId) {
      try {
        const chargeInfo = await retrieveCharge(existingCampaign.payment.omiseChargeId);
        return NextResponse.json({
          chargeId: existingCampaign.payment.omiseChargeId,
          qrCodeUrl: chargeInfo.qrCodeUrl,
          paymentId: existingCampaign.payment.id,
          campaignId: existingCampaign.id,
        });
      } catch {
        // Charge no longer exists in Omise (expired/deleted) — fall through to create a new one
        console.log("[POST /api/payments/create-charge] Existing charge not found in Omise, creating new charge");
      }
    }

    // 7. Create Campaign, CampaignProduct, CampaignCreators, and Payment atomically
    const { campaign, payment } = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.create({
        data: {
          userId: userId,
          countryId,
          packageId,
          promotionType: promotionType as PromotionType,
          status: CampaignStatus.AWAITING_PAYMENT,
        },
      });

      await tx.campaignProduct.create({
        data: {
          campaignId: campaign.id,
          brandName: productData.brandName,
          productName: productData.productName,
          category: productData.category,
          description: productData.description,
          sellingPoints: productData.sellingPoints,
          url: productData.url ?? null,
          imageUrl: productData.imageUrl ?? null,
          isService: productData.isService,
          weight: productData.weight ?? null,
          length: productData.length ?? null,
          width: productData.width ?? null,
          height: productData.height ?? null,
        },
      });

      await tx.campaignCreator.createMany({
        data: creatorIds.map((creatorId) => ({
          campaignId: campaign.id,
          creatorId,
        })),
      });

      const payment = await tx.payment.create({
        data: {
          userId: userId,
          campaignId: campaign.id,
          amount: totalSatang,
          currency: "THB",
          method: PaymentMethod.QR_CODE,
          status: PaymentStatus.PENDING,
          omiseChargeId: null,
        },
      });

      return { campaign, payment };
    });

    // 8. Create Omise PromptPay charge — outside transaction so failures can be handled
    try {
      const charge = await createPromptPayCharge(totalSatang);

      // 9. Link charge to payment record
      await prisma.payment.update({
        where: { id: payment.id },
        data: { omiseChargeId: charge.chargeId },
      });

      return NextResponse.json({
        chargeId: charge.chargeId,
        qrCodeUrl: charge.qrCodeUrl,
        paymentId: payment.id,
        campaignId: campaign.id,
      });
    } catch (omiseError) {
      // Omise failed — mark records as cancelled/failed for audit trail
      console.error("[POST /api/payments/create-charge] Omise error:", omiseError);
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED },
        }),
        prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: CampaignStatus.CANCELLED },
        }),
      ]);
      return NextResponse.json({ error: "Payment service error" }, { status: 502 });
    }
  } catch (error) {
    console.error("[POST /api/payments/create-charge] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
