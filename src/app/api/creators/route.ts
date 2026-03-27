import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packageIdParam = searchParams.get("packageId");

  if (!packageIdParam) {
    return NextResponse.json({ error: "packageId query param is required" }, { status: 400 });
  }

  const packageId = parseInt(packageIdParam, 10);
  if (isNaN(packageId)) {
    return NextResponse.json({ error: "packageId must be a number" }, { status: 400 });
  }

  const packageCreators = await prisma.packageCreator.findMany({
    where: { packageId },
    include: { creator: true },
    orderBy: [{ isBackup: "asc" }, { sortOrder: "asc" }],
  });

  const creators = packageCreators.map((pc) => ({
    ...pc.creator,
    isBackup: pc.isBackup,
    sortOrder: pc.sortOrder,
  }));

  return NextResponse.json(creators);
}
