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
  Prisma,
} from "@/generated/prisma/client";

// Sliding-window rate limit for package-change replacements only.
// Fresh campaign creations (no previousCampaignId) are never counted.
const replacementTimestamps = new Map<string, number[]>();
const REPLACEMENT_LIMIT = 5;
const REPLACEMENT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkReplacementRateLimit(userId: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const timestamps = (replacementTimestamps.get(userId) ?? []).filter(t => now - t < REPLACEMENT_WINDOW_MS);
  if (timestamps.length >= REPLACEMENT_LIMIT) {
    const retryAfterSecs = Math.ceil((timestamps[0] + REPLACEMENT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSecs };
  }
  timestamps.push(now);
  replacementTimestamps.set(userId, timestamps);
  return { allowed: true, retryAfterSecs: 0 };
}

const createChargeSchema = z.object({
  countryId: z.number().int().positive(),
  packageId: z.number().int().positive(),
  promotionType: z.enum(["PRODUCT", "SERVICE"]),
  creatorIds: z.array(z.string().min(1)),
  previousCampaignId: z.string().optional(),
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

function isIdempotencyKeyConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray((error.meta as { target?: unknown })?.target) &&
    ((error.meta as { target: string[] }).target).includes("idempotency_key")
  );
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? null;

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

  const { countryId, packageId, promotionType, creatorIds, productData, previousCampaignId } =
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
    const { totalSatang } = calculateTotalWithFees(pkg);

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
        if (chargeInfo.status === "pending") {
          return NextResponse.json({
            chargeId: existingCampaign.payment.omiseChargeId,
            qrCodeUrl: chargeInfo.qrCodeUrl,
            paymentId: existingCampaign.payment.id,
            campaignId: existingCampaign.id,
          });
        }
        // Charge exists in Omise but is no longer pending (failed/expired) — create a new one
        console.log("[POST /api/payments/create-charge] Existing charge is not pending, creating new charge");
      } catch {
        // Charge no longer exists in Omise (expired/deleted) — fall through to create a new one
        console.log("[POST /api/payments/create-charge] Existing charge not found in Omise, creating new charge");
      }
    }

    // 7. Handle package-change replacement — update existing campaign in-place
    // This avoids creating a cancelled + new campaign row in the list.
    if (previousCampaignId) {
      const rateCheck = checkReplacementRateLimit(userId);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: "RATE_LIMITED", retryAfterSecs: rateCheck.retryAfterSecs },
          { status: 429 },
        );
      }

      const existingCamp = await prisma.campaign.findUnique({
        where: { id: previousCampaignId },
        include: { payment: true, products: true },
      });

      if (
        existingCamp &&
        existingCamp.userId === userId &&
        existingCamp.status === CampaignStatus.AWAITING_PAYMENT
      ) {
        // NOTE: PromptPay charges do not support the Omise expire API
        // (returns failed_expire). The old QR expires naturally at its expires_at time.
        // Protection: we clear omiseChargeId from the payment record below, so any
        // payment on the old charge won't be matched by the webhook handler.

        // 7b. Update campaign + relations atomically
        await prisma.$transaction(async (tx) => {
          await tx.campaign.update({
            where: { id: existingCamp.id },
            data: { packageId, promotionType: promotionType as PromotionType },
          });

          // Replace product
          await tx.campaignProduct.deleteMany({ where: { campaignId: existingCamp.id } });
          await tx.campaignProduct.create({
            data: {
              campaignId: existingCamp.id,
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

          // Replace creators
          await tx.campaignCreator.deleteMany({ where: { campaignId: existingCamp.id } });
          await tx.campaignCreator.createMany({
            data: creatorIds.map((creatorId) => ({ campaignId: existingCamp.id, creatorId })),
          });

          // Reset payment for new charge
          if (existingCamp.payment) {
            await tx.payment.update({
              where: { id: existingCamp.payment.id },
              data: {
                amount: totalSatang,
                omiseChargeId: null,
                chargeCreatedAt: null,
                status: PaymentStatus.PENDING,
                idempotencyKey,
              },
            });
          }
        });

        // 7c. Create new Omise charge for updated amount
        try {
          const charge = await createPromptPayCharge(totalSatang);
          await prisma.payment.update({
            where: { id: existingCamp.payment!.id },
            data: { omiseChargeId: charge.chargeId, chargeCreatedAt: new Date() },
          });
          return NextResponse.json({
            chargeId: charge.chargeId,
            qrCodeUrl: charge.qrCodeUrl,
            paymentId: existingCamp.payment!.id,
            campaignId: existingCamp.id,
          });
        } catch (omiseError) {
          console.error("[create-charge] Omise error on campaign update:", omiseError);
          return NextResponse.json({ error: "Payment service error" }, { status: 502 });
        }
      }
      // Previous campaign not found or no longer AWAITING_PAYMENT — fall through to create new
    }

    // 9. Create Campaign, CampaignProduct, CampaignCreators, and Payment atomically
    let campaign: Awaited<ReturnType<typeof prisma.campaign.create>>;
    let payment: Awaited<ReturnType<typeof prisma.payment.create>>;
    try {
    const result = await prisma.$transaction(async (tx) => {
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
          idempotencyKey,
        },
      });

      return { campaign, payment };
    });
    campaign = result.campaign;
    payment = result.payment;
    } catch (txError) {
      if (isIdempotencyKeyConflict(txError)) {
        // Concurrent request with same key — find and return the winning request's charge
        const existing = await prisma.payment.findUnique({
          where: { idempotencyKey: idempotencyKey! },
          include: { campaign: true },
        });
        if (!existing?.omiseChargeId) {
          // Winner hasn't linked the chargeId yet — tell client to retry
          return NextResponse.json(
            { error: "Payment in progress, retry in a moment" },
            { status: 409 }
          );
        }
        try {
          const chargeInfo = await retrieveCharge(existing.omiseChargeId);
          return NextResponse.json({
            chargeId: existing.omiseChargeId,
            qrCodeUrl: chargeInfo.qrCodeUrl,
            paymentId: existing.id,
            campaignId: existing.campaignId,
          });
        } catch {
          return NextResponse.json(
            { error: "Payment in progress, retry in a moment" },
            { status: 409 }
          );
        }
      }
      throw txError;
    }

    // 8. Create Omise PromptPay charge — outside transaction so failures can be handled
    try {
      const charge = await createPromptPayCharge(totalSatang);

      // 9. Link charge to payment record and record when the charge was created
      await prisma.payment.update({
        where: { id: payment.id },
        data: { omiseChargeId: charge.chargeId, chargeCreatedAt: new Date() },
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
