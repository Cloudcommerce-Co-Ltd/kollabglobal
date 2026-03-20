import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { prepareBriefContent, type BriefContent, type TranslatedContent } from "@/lib/brief-utils";

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

  const body = await req.json() as { content: BriefContent; translated?: TranslatedContent };
  const { content, translated } = body;
  const { finalContent, contentTh } = prepareBriefContent(content, translated);

  const brief = await prisma.campaignBrief.upsert({
    where: { campaignId: id },
    create: { campaignId: id, content: finalContent, contentTh },
    update: { content: finalContent, contentTh },
  });

  await prisma.campaign.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json(brief, { status: 201 });
}
