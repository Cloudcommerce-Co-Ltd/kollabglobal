import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { campaignStatusSchema, LEGAL_TRANSITIONS } from "@/lib/validations/campaign-status";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const raw = await req.json();
  const parsed = campaignStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { status: targetStatus } = parsed.data;
  const allowed = LEGAL_TRANSITIONS[campaign.status] ?? [];

  if (!allowed.includes(targetStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${campaign.status} to ${targetStatus}` },
      { status: 400 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.campaign.update({
      where: { id },
      data: {
        status: targetStatus,
        ...(targetStatus === "COMPLETED" ? { liveAt: new Date() } : {}),
      },
    });
    await tx.campaignStatusLog.create({
      data: {
        campaignId: id,
        fromStatus: campaign.status,
        toStatus: targetStatus,
        changedBy: session.user!.id,
      },
    });
    return result;
  });

  return NextResponse.json(updated);
}
