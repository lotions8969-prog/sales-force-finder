import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const userId = (session.user as { id?: string }).id!;
  const userRole = (session.user as { role?: string }).role;

  const assessmentSession = await prisma.assessmentSession.findFirst({
    where: {
      id: sessionId,
      // 管理者は全セッション閲覧可
      ...(userRole !== "admin" ? { userId } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      scoreProfiles: true,
      roleFitResults: { orderBy: { rank: "asc" } },
      developmentRecommendations: { orderBy: { priority: "asc" } },
    },
  });

  if (!assessmentSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(assessmentSession);
}
