import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const packages = await prisma.package.findMany({
    orderBy: { numCreators: "asc" },
  });
  return NextResponse.json(packages);
}
