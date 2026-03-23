import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
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

  if (campaign.status !== "AWAITING_SHIPMENT") {
    return NextResponse.json(
      { error: "Campaign is not awaiting shipment" },
      { status: 400 }
    );
  }

  if (campaign.promotionType !== "PRODUCT") {
    return NextResponse.json(
      { error: "Shipment confirmation is only for product campaigns" },
      { status: 400 }
    );
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json(updated);
}
