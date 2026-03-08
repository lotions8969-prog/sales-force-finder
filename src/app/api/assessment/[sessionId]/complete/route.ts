import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import type { ItemResponse } from "@/types";
import { computeScoreProfiles } from "@/lib/scoring";
import { computeRoleFitScores } from "@/lib/role-fit";
import { generateReport } from "@/lib/report-generator";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const userId = (session.user as { id?: string }).id!;

  // セッションの確認
  const assessmentSession = await prisma.assessmentSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!assessmentSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // 既に完了済みの場合はそのまま返す
  if (assessmentSession.status === "completed") {
    return NextResponse.json({ success: true, sessionId });
  }

  // リクエストボディから回答を取得
  const body = await req.json();
  const responses: ItemResponse[] = body.responses;

  if (!responses || responses.length === 0) {
    return NextResponse.json({ error: "No responses provided" }, { status: 400 });
  }

  // 回答をDBに保存（SQLite は skipDuplicates 非対応のため削除）
  await prisma.itemResponse.createMany({
    data: responses.map((r) => ({
      sessionId,
      questionId: r.questionId,
      questionType: r.questionType,
      responseValue: String(r.responseValue),
    })),
  });

  // スコアを計算
  const scoreProfiles = computeScoreProfiles(responses);
  const roleFitResults = computeRoleFitScores(scoreProfiles);
  const report = generateReport(scoreProfiles, roleFitResults);

  // スコアをDBに保存
  await prisma.scoreProfile.createMany({
    data: scoreProfiles.map((sp) => ({
      sessionId,
      factorKey: sp.factorKey,
      rawScore: sp.rawScore,
      standardizedScore: sp.standardizedScore,
    })),
  });

  // 役割適性をDBに保存
  await prisma.roleFitResult.createMany({
    data: roleFitResults.map((rf) => ({
      sessionId,
      roleKey: rf.roleKey,
      fitScore: rf.fitScore,
      rank: rf.rank,
    })),
  });

  // 推奨事項をDBに保存
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

  // セッションを完了に更新
  await prisma.assessmentSession.update({
    where: { id: sessionId },
    data: { status: "completed", completedAt: new Date() },
  });

  return NextResponse.json({ success: true, sessionId });
}
