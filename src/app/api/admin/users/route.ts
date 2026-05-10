import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function checkAdmin(req: NextRequest) {
  const supaUser = await getServerUser(req);
  if (!supaUser) return null;
  if (ADMIN_EMAIL && supaUser.email === ADMIN_EMAIL) return supaUser;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: supaUser.id },
      select: { role: true },
    });
    if (dbUser?.role === "ADMIN") return supaUser;
  } catch {
    // ignore
  }
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { posts: true, socialAccounts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await req.json();
  if (!userId || !["USER", "ADMIN"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid userId or role" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
