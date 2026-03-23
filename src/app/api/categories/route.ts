import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
    },
    orderBy: { id: "asc" },
    select: { id: true, name: true, type: true },
  });
  return NextResponse.json(categories);
}
