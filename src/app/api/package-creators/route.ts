import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { CreatorWithPackageInfo } from "@/types";

export async function GET() {
  const packageCreators = await prisma.packageCreator.findMany({
    where: { isBackup: false },
    include: { creator: true },
    orderBy: { sortOrder: "asc" },
  });

  const grouped = packageCreators.reduce<Record<number, CreatorWithPackageInfo[]>>(
    (acc, pc) => {
      if (!acc[pc.packageId]) acc[pc.packageId] = [];
      acc[pc.packageId].push({
        ...pc.creator,
        isBackup: pc.isBackup,
        sortOrder: pc.sortOrder,
      });
      return acc;
    },
    {}
  );

  return NextResponse.json(grouped);
}
