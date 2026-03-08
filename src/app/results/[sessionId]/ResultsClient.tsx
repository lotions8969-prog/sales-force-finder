"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FACTOR_DEFINITIONS } from "@/data/factor-definitions";
import { ROLE_DEFINITIONS } from "@/data/role-definitions";
import type { FactorKey, RoleKey, ScoreProfile, RoleFitResult } from "@/types";
import ResultsRadarChart from "./ResultsRadarChart";

interface ReportOutput {
  salesStyle: string;
  managerTips: string;
  weeklyActions: string[];
  developmentPlan: string;
  teamComplement: string;
  overuseWarning: string;
}

export interface SavedResults {
  scoreProfiles: { factorKey: string; rawScore: number; standardizedScore: number }[];
  roleFitResults: { roleKey: string; fitScore: number; rank: number }[];
  report: ReportOutput;
  userName: string;
  completedAt: string;
}

export default function ResultsClient({
  sessionId,
  serverData,
}: {
  sessionId: string;
  serverData: SavedResults | null;
}) {
  const [results, setResults] = useState<SavedResults | null>(serverData);
  const [loading, setLoading] = useState(!serverData);

  useEffect(() => {
    if (serverData) return;
    // localStorageから結果を読み込む
    try {
      const stored = localStorage.getItem(`assessment_result_${sessionId}`);
      if (stored) {
        setResults(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [sessionId, serverData]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#64748b" }}>結果を読み込み中...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>診断結果が見つかりません。</p>
        <Link href="/assessment" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
          診断を受け直す →
        </Link>
      </div>
    );
  }

  const { scoreProfiles, roleFitResults, report, userName, completedAt } = results;
  const scores = scoreProfiles;
  const sortedScores = [...scores].sort((a, b) => b.standardizedScore - a.standardizedScore);
  const topStrengths = sortedScores.slice(0, 5).map((s) => s.factorKey as FactorKey);
  const growthAreas = sortedScores.slice(-3).reverse().map((s) => s.factorKey as FactorKey);
  const overuseRisks = scores.filter((s) => s.standardizedScore >= 85).map((s) => s.factorKey as FactorKey);
  const topRoles = roleFitResults.slice(0, 3);

  const radarData = scores.map((s) => ({
    factor: FACTOR_DEFINITIONS[s.factorKey as FactorKey]?.labelJa ?? s.factorKey,
    score: s.standardizedScore,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/dashboard" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
          ← ダッシュボードへ
        </Link>
        <Link href={`/api/admin/export?sessionId=${sessionId}`} style={{ background: "#f1f5f9", color: "#374151", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
          📥 CSVエクスポート
        </Link>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {userName}さんの診断結果
          </h1>
          <p style={{ color: "#64748b", marginTop: "4px", fontSize: "0.9rem" }}>
            診断完了日：{new Date(completedAt).toLocaleDateString("ja-JP")}
          </p>
        </div>

        {/* Radar + Top Strengths */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "#0f172a" }}>📊 9因子スコアチャート</h2>
            <ResultsRadarChart data={radarData} />
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "#0f172a" }}>🏆 上位強み Top5</h2>
            {topStrengths.map((factorKey, i) => {
              const def = FACTOR_DEFINITIONS[factorKey];
              const score = scores.find((s) => s.factorKey === factorKey)?.standardizedScore ?? 0;
              return (
                <div key={factorKey} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "22px", height: "22px", background: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : i === 2 ? "#cd7c3e" : "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: i < 3 ? "white" : "#374151", flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{def.labelJa}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: def.color }}>{score}</span>
                  </div>
                  <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "9999px" }}>
                    <div style={{ height: "100%", width: `${score}%`, background: def.color, borderRadius: "9999px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Fit + Growth Areas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "#0f172a" }}>🎭 向いている営業役割 Top3</h2>
            {topRoles.map((rf) => {
              const def = ROLE_DEFINITIONS[rf.roleKey as RoleKey];
              if (!def) return null;
              return (
                <div key={rf.roleKey} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", padding: "12px 16px", background: rf.rank === 1 ? `${def.color}10` : "#f8fafc", borderRadius: "10px", border: rf.rank === 1 ? `1px solid ${def.color}30` : "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "1.5rem" }}>{def.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{def.labelJa}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>{def.description.slice(0, 40)}…</div>
                  </div>
                  <div style={{ fontWeight: 700, color: def.color, fontSize: "1.1rem" }}>{rf.fitScore}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "#0f172a" }}>📈 伸ばすべき領域 Top3</h2>
            {growthAreas.map((factorKey) => {
              const def = FACTOR_DEFINITIONS[factorKey];
              const score = scores.find((s) => s.factorKey === factorKey)?.standardizedScore ?? 0;
              return (
                <div key={factorKey} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{def.labelJa}</span>
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{score}</span>
                  </div>
                  <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "9999px" }}>
                    <div style={{ height: "100%", width: `${score}%`, background: "#94a3b8", borderRadius: "9999px" }} />
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>{def.description.slice(0, 60)}…</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <RecommendCard icon="💼" title="推奨営業スタイル" content={report.salesStyle} color="#6366f1" />
          <div style={{ background: "white", borderRadius: "16px", padding: "24px 28px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "#0f172a" }}>⚡ 今週から実践すべき3つのアクション</h3>
            {report.weeklyActions.map((action, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <span style={{ width: "22px", height: "22px", background: "#6366f1", borderRadius: "50%", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
                <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6, margin: 0 }}>{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <RecommendCard icon="👨‍💼" title="上司が知っておくべき関わり方" content={report.managerTips} color="#22c55e" />
          <RecommendCard icon="🌱" title="育成施策の提案" content={report.developmentPlan} color="#f59e0b" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <RecommendCard icon="🤝" title="チーム内での補完関係の示唆" content={report.teamComplement} color="#14b8a6" />
          <div style={{ background: overuseRisks.length > 0 ? "#fffbeb" : "white", borderRadius: "16px", padding: "24px 28px", border: overuseRisks.length > 0 ? "1px solid #fcd34d" : "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>⚠️ 強みの過剰使用リスク</h3>
            <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{report.overuseWarning}</p>
          </div>
        </div>

        {/* All Scores Table */}
        <div style={{ background: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "#0f172a" }}>📋 全因子スコア一覧</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>因子</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>英語名</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>スコア</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>分布</th>
                </tr>
              </thead>
              <tbody>
                {sortedScores.map((sp) => {
                  const def = FACTOR_DEFINITIONS[sp.factorKey as FactorKey];
                  if (!def) return null;
                  return (
                    <tr key={sp.factorKey} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{def.labelJa}</td>
                      <td style={{ padding: "10px 12px", fontSize: "0.8rem", color: "#64748b" }}>{def.labelEn}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: def.color, fontSize: "1rem" }}>{sp.standardizedScore}</span>
                      </td>
                      <td style={{ padding: "10px 12px", width: "200px" }}>
                        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "9999px" }}>
                          <div style={{ height: "100%", width: `${sp.standardizedScore}%`, background: def.color, borderRadius: "9999px" }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function RecommendCard({ icon, title, content, color }: { icon: string; title: string; content: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "24px 28px", border: "1px solid #e2e8f0" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>{icon} {title}</h3>
      <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: "12px" }}>
        <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{content}</p>
      </div>
    </div>
  );
}
