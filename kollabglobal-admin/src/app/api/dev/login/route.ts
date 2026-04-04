import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: "dev-admin-1" } });
  if (!user) {
    return NextResponse.json(
      { error: "Dev admin user not found — run pnpm exec prisma db seed" },
      { status: 404 }
    );
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { sessionToken: token, userId: user.id, expires },
  });

  const res = NextResponse.redirect(new URL("/", req.url), { status: 302 });

  res.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  return res;
}
