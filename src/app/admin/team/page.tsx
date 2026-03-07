import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FACTOR_DEFINITIONS } from "@/data/factor-definitions";
import { ROLE_DEFINITIONS } from "@/data/role-definitions";
import type { FactorKey, RoleKey } from "@/types";
import TeamRadarChart from "./TeamRadarChart";

export default async function AdminTeamPage() {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");

  // 完了済みセッションをすべて取得
  const completedSessions = await prisma.assessmentSession.findMany({
    where: { status: "completed" },
    include: {
      user: true,
      scoreProfiles: true,
      roleFitResults: { orderBy: { rank: "asc" }, take: 1 },
    },
    orderBy: { completedAt: "desc" },
  });

  const totalMembers = await prisma.user.count({ where: { role: "member" } });

  // チーム平均スコアを計算
  const factorKeys = Object.keys(FACTOR_DEFINITIONS) as FactorKey[];
  const teamAvgScores: Record<FactorKey, number> = {} as Record<FactorKey, number>;

  for (const fk of factorKeys) {
    const scores = completedSessions.flatMap((s) =>
      s.scoreProfiles.filter((sp) => sp.factorKey === fk).map((sp) => sp.standardizedScore)
    );
    teamAvgScores[fk] =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
  }

  // 役割分布カウント
  const roleCounts: Record<string, number> = {};
  for (const s of completedSessions) {
    const topRole = s.roleFitResults[0]?.roleKey;
    if (topRole) roleCounts[topRole] = (roleCounts[topRole] ?? 0) + 1;
  }

  const radarData = factorKeys.map((fk) => ({
    factor: FACTOR_DEFINITIONS[fk].labelJa,
    score: teamAvgScores[fk],
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/dashboard" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none", fontSize: "1.1rem" }}>
          📊 営業強み診断
        </Link>
        <Link href="/admin/members" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>
          メンバー管理
        </Link>
        <Link href="/admin/team" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem", borderBottom: "2px solid #6366f1", paddingBottom: "2px" }}>
          チーム分析
        </Link>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            チーム強み分析
          </h1>
          <p style={{ color: "#64748b", marginTop: "4px", fontSize: "0.9rem" }}>
            {completedSessions.length}名が診断完了 / 全{totalMembers}名
          </p>
        </div>

        {completedSessions.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "60px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
              まだ診断結果がありません。
              <br />
              メンバーに診断を受けてもらいましょう。
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              {/* トップ因子 */}
              {(() => {
                const topFactor = factorKeys.reduce((a, b) =>
                  teamAvgScores[a] > teamAvgScores[b] ? a : b
                );
                const weakFactor = factorKeys.reduce((a, b) =>
                  teamAvgScores[a] < teamAvgScores[b] ? a : b
                );
                return (
                  <>
                    <div
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                        チーム最強因子
                      </div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        {FACTOR_DEFINITIONS[topFactor].labelJa}
                      </div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#22c55e" }}>
                        {teamAvgScores[topFactor]}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                        チーム強化領域
                      </div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        {FACTOR_DEFINITIONS[weakFactor].labelJa}
                      </div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b" }}>
                        {teamAvgScores[weakFactor]}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Radar + Role Distribution */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "28px",
              }}
            >
              {/* Team Radar */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "16px",
                    color: "#0f172a",
                  }}
                >
                  📊 チーム平均スコアチャート
                </h2>
                <TeamRadarChart data={radarData} />
              </div>

              {/* Role Distribution */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "16px",
                    color: "#0f172a",
                  }}
                >
                  🎭 役割適性の分布
                </h2>
                {Object.entries(ROLE_DEFINITIONS).map(([roleKey, def]) => {
                  const count = roleCounts[roleKey] ?? 0;
                  const pct =
                    completedSessions.length > 0
                      ? Math.round((count / completedSessions.length) * 100)
                      : 0;
                  return (
                    <div key={roleKey} style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.82rem",
                          marginBottom: "3px",
                        }}
                      >
                        <span>
                          {def.icon} {def.labelJa}
                        </span>
                        <span style={{ color: "#64748b" }}>
                          {count}名 ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: "#e2e8f0",
                          borderRadius: "9999px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: def.color,
                            borderRadius: "9999px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Factor Average Table */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "28px",
                border: "1px solid #e2e8f0",
                marginBottom: "28px",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                  color: "#0f172a",
                }}
              >
                📋 因子別チーム平均スコア
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "12px",
                }}
              >
                {factorKeys
                  .sort((a, b) => teamAvgScores[b] - teamAvgScores[a])
                  .map((fk) => {
                    const def = FACTOR_DEFINITIONS[fk];
                    const score = teamAvgScores[fk];
                    return (
                      <div key={fk}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.875rem",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{def.labelJa}</span>
                          <span style={{ fontWeight: 700, color: def.color }}>{score}</span>
                        </div>
                        <div
                          style={{
                            height: "8px",
                            background: "#e2e8f0",
                            borderRadius: "9999px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${score}%`,
                              background: def.color,
                              borderRadius: "9999px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Member Summary */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "28px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                  color: "#0f172a",
                }}
              >
                👥 メンバー別サマリー
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.78rem", color: "#64748b" }}>
                        氏名
                      </th>
                      {factorKeys.map((fk) => (
                        <th
                          key={fk}
                          style={{
                            textAlign: "center",
                            padding: "8px 8px",
                            fontSize: "0.7rem",
                            color: "#64748b",
                            minWidth: "60px",
                          }}
                        >
                          {FACTOR_DEFINITIONS[fk].labelJa.slice(0, 4)}
                        </th>
                      ))}
                      <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.78rem", color: "#64748b" }}>
                        上位役割
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSessions.map((s) => {
                      const scoreMap: Record<string, number> = {};
                      for (const sp of s.scoreProfiles) {
                        scoreMap[sp.factorKey] = sp.standardizedScore;
                      }
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 500, fontSize: "0.85rem" }}>
                            <Link
                              href={`/results/${s.id}`}
                              style={{ color: "#6366f1", textDecoration: "none" }}
                            >
                              {s.user.name}
                            </Link>
                          </td>
                          {factorKeys.map((fk) => {
                            const score = scoreMap[fk] ?? 0;
                            const def = FACTOR_DEFINITIONS[fk];
                            return (
                              <td
                                key={fk}
                                style={{
                                  padding: "10px 8px",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: score >= 70 ? 700 : 400,
                                  color: score >= 70 ? def.color : score < 40 ? "#94a3b8" : "#374151",
                                }}
                              >
                                {score}
                              </td>
                            );
                          })}
                          <td style={{ padding: "10px 12px", fontSize: "0.82rem", color: "#374151" }}>
                            {s.roleFitResults[0]
                              ? ROLE_DEFINITIONS[s.roleFitResults[0].roleKey as RoleKey]?.icon +
                                " " +
                                ROLE_DEFINITIONS[s.roleFitResults[0].roleKey as RoleKey]?.labelJa
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
