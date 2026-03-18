import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const creators = await prisma.creator.findMany({
    where: { isBackup: false },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(creators);
}
