import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { creators: true },
      },
    },
  });

  const sorted = countries
    .map(({ _count, ...country }) => ({
      ...country,
      creatorsAvail: _count.creators,
    }))
    .sort((a, b) => b.creatorsAvail - a.creatorsAvail || a.name.localeCompare(b.name));

  return NextResponse.json(sorted);
}
