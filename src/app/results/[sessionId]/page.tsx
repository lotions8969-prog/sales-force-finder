import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { redirect } from "next/navigation";
import ResultsClient from "./ResultsClient";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { sessionId } = await params;
  const userId = (session.user as { id?: string }).id!;
  const userRole = (session.user as { role?: string }).role;

  // DBから取得を試みる（失敗してもlocalStorageフォールバックがある）
  let serverData = null;
  try {
    await ensureDbInitialized().catch(() => null);
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        ...(userRole !== "admin" ? { userId } : {}),
        status: "completed",
      },
      include: {
        user: true,
        scoreProfiles: true,
        roleFitResults: { orderBy: { rank: "asc" } },
        developmentRecommendations: { orderBy: { priority: "asc" } },
      },
    });

    if (assessmentSession && assessmentSession.scoreProfiles.length > 0) {
      const scoreProfiles = assessmentSession.scoreProfiles.map((sp) => ({
        factorKey: sp.factorKey,
        rawScore: sp.rawScore,
        standardizedScore: sp.standardizedScore,
      }));
      const roleFitResults = assessmentSession.roleFitResults.map((rf) => ({
        roleKey: rf.roleKey,
        fitScore: rf.fitScore,
        rank: rf.rank,
      }));
      const recs = assessmentSession.developmentRecommendations;
      const getContent = (type: string) => recs.find((r) => r.type === type)?.content ?? "";

      serverData = {
        scoreProfiles,
        roleFitResults,
        report: {
          salesStyle: getContent("style"),
          managerTips: getContent("manager_tip"),
          weeklyActions: getContent("action").split("\n").filter(Boolean),
          developmentPlan: getContent("development"),
          teamComplement: getContent("team"),
          overuseWarning: getContent("risk"),
        },
        userName: assessmentSession.user.name,
        completedAt: assessmentSession.completedAt?.toISOString() ?? new Date().toISOString(),
      };
    }
  } catch {
    // DB失敗 → クライアント側でlocalStorageから取得
  }

  return <ResultsClient sessionId={sessionId} serverData={serverData} />;
}
