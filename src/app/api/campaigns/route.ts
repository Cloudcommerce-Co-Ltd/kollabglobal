import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserCampaigns } from "@/lib/data/campaigns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await getUserCampaigns(session.user.id);
  return NextResponse.json(campaigns);
}

