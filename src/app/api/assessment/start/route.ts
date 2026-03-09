import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { NextResponse } from "next/server";

export async function POST() {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;

  try {
    // 新しいセッションを作成
    const assessmentSession = await prisma.assessmentSession.create({
      data: { userId },
    });
    return NextResponse.json({ sessionId: assessmentSession.id });
  } catch (e) {
    console.error("Assessment start error:", e);
    return NextResponse.json({ error: "セッション作成に失敗しました" }, { status: 500 });
  }
}
