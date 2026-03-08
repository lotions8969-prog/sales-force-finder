import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { NextResponse } from "next/server";
import type { ItemResponse } from "@/types";
import { computeScoreProfiles } from "@/lib/scoring";
import { computeRoleFitScores } from "@/lib/role-fit";
import { generateReport } from "@/lib/report-generator";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const userId = (session.user as { id?: string }).id!;

  // リクエストボディから回答を取得
  const body = await req.json();
  const responses: ItemResponse[] = body.responses;

  if (!responses || responses.length === 0) {
    return NextResponse.json({ error: "No responses provided" }, { status: 400 });
  }

  // スコアを計算（これは必ず成功する純粋関数）
  const scoreProfiles = computeScoreProfiles(responses);
  const roleFitResults = computeRoleFitScores(scoreProfiles);
  const report = generateReport(scoreProfiles, roleFitResults);

  // DBへの保存はベストエフォート（失敗しても結果は返す）
  try {
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (assessmentSession && assessmentSession.status !== "completed") {
      await prisma.itemResponse.createMany({
        data: responses.map((r) => ({
          sessionId,
          questionId: r.questionId,
          questionType: r.questionType,
          responseValue: String(r.responseValue),
        })),
      });

      await prisma.scoreProfile.createMany({
        data: scoreProfiles.map((sp) => ({
          sessionId,
          factorKey: sp.factorKey,
          rawScore: sp.rawScore,
          standardizedScore: sp.standardizedScore,
        })),
      });

      await prisma.roleFitResult.createMany({
        data: roleFitResults.map((rf) => ({
          sessionId,
          roleKey: rf.roleKey,
          fitScore: rf.fitScore,
          rank: rf.rank,
        })),
      });

      const recommendations = [
        { type: "style", content: report.salesStyle, priority: 1 },
        { type: "manager_tip", content: report.managerTips, priority: 2 },
        { type: "action", content: report.weeklyActions.join("\n"), priority: 3 },
        { type: "development", content: report.developmentPlan, priority: 4 },
        { type: "team", content: report.teamComplement, priority: 5 },
        { type: "risk", content: report.overuseWarning, priority: 6 },
      ];

      await prisma.developmentRecommendation.createMany({
        data: recommendations.map((r) => ({ ...r, sessionId })),
      });

      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: { status: "completed", completedAt: new Date() },
      });
    }
  } catch (e) {
    // DB保存失敗は無視 - 結果は必ずクライアントに返す
    console.error("DB save failed (non-critical):", e);
  }

  // 計算結果を常に返す（DBに依存しない）
  return NextResponse.json({
    success: true,
    sessionId,
    results: {
      scoreProfiles,
      roleFitResults,
      report,
      userName: (session.user as { name?: string }).name ?? "あなた",
      completedAt: new Date().toISOString(),
    },
  });
}
