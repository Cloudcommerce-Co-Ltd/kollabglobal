import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { prepareBriefContent } from "@/lib/brief-utils";
import { briefSubmitSchema } from "@/lib/validations/brief";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const brief = await prisma.campaignBrief.findFirst({
    where: {
      campaignId: id,
      campaign: { userId: session.user.id },
    },
  });

  if (!brief) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(brief);
}

export async function POST(
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
  const parsed = briefSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { content, translated } = parsed.data;
  const { finalContent, contentTh } = prepareBriefContent(content, translated);

  const now = new Date();
  const brief = await prisma.campaignBrief.upsert({
    where: { campaignId: id },
    create: { campaignId: id, content: finalContent, contentTh, publishedAt: now },
    update: { content: finalContent, contentTh, publishedAt: now },
  });

  await prisma.campaign.update({
    where: { id },
    data: { status: "ACCEPTING" },
  });

  return NextResponse.json(brief, { status: 201 });
}
