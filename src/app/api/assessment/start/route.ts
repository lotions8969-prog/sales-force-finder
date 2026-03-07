import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;

  // 新しいセッションを作成
  const assessmentSession = await prisma.assessmentSession.create({
    data: { userId },
  });

  return NextResponse.json({ sessionId: assessmentSession.id });
}
