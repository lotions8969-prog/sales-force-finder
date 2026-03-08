import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// メンバー追加（管理者のみ）
export async function POST(req: Request) {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, teamId } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "member",
      teamId: teamId ?? null,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}

// メンバー一覧取得（管理者のみ）
export async function GET() {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { role: "member" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}
