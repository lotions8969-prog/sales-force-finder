import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FACTOR_DEFINITIONS } from "@/data/factor-definitions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id?: string }).id!;
  const userRole = (session.user as { role?: string }).role;

  await ensureDbInitialized().catch(() => null);

  // 最新セッションを取得
  const latestSession = await prisma.assessmentSession.findFirst({
    where: { userId, status: "completed" },
    orderBy: { completedAt: "desc" },
    include: { scoreProfiles: true, roleFitResults: true },
  }).catch(() => null);

  // チーム全体の完了済みセッション数
  const totalCompleted = await prisma.assessmentSession.count({
    where: { status: "completed" },
  }).catch(() => 0);

  const totalMembers = await prisma.user.count({ where: { role: "member" } }).catch(() => 0);

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
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.3rem" }}>📊</span>
          <span style={{ fontWeight: 700, color: "#6366f1", fontSize: "1.1rem" }}>
            営業強み診断
          </span>
        </div>
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
            ダッシュボード
          </Link>
          {userRole === "admin" && (
            <>
              <Link href="/admin/members" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>
                メンバー管理
              </Link>
              <Link href="/admin/team" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>
                チーム分析
              </Link>
            </>
          )}
          <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
            {session.user.name}
          </span>
          <Link
            href="/api/auth/signout"
            style={{
              background: "#f1f5f9",
              color: "#64748b",
              padding: "6px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            ログアウト
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            こんにちは、{session.user.name}さん 👋
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            営業強み診断ツール — あなたの強みを発見し、営業活動に活かしましょう。
          </p>
        </div>

        {/* Stats Cards */}
        {userRole === "admin" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <StatCard icon="👥" label="チームメンバー" value={totalMembers} unit="名" color="#6366f1" />
            <StatCard icon="✅" label="診断完了" value={totalCompleted} unit="件" color="#22c55e" />
            <StatCard
              icon="📈"
              label="受検率"
              value={totalMembers > 0 ? Math.round((totalCompleted / totalMembers) * 100) : 0}
              unit="%"
              color="#f59e0b"
            />
          </div>
        )}

        {/* Assessment CTA / Latest Result */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: latestSession ? "1fr 1fr" : "1fr",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Diagnostic Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "16px",
              padding: "32px",
              color: "white",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎯</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, marginBottom: "8px" }}>
              {latestSession ? "診断を再受検する" : "診断を開始する"}
            </h2>
            <p style={{ opacity: 0.85, fontSize: "0.9rem", marginBottom: "24px" }}>
              所要時間：15〜20分 | 65問
              <br />
              Likert形式・比較選択・営業シナリオ
            </p>
            <Link
              href="/assessment"
              style={{
                display: "inline-block",
                background: "white",
                color: "#6366f1",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              {latestSession ? "再度受検する" : "診断スタート"}
            </Link>
          </div>

          {/* Latest Result Preview */}
          {latestSession && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "28px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}
              >
                📋 最新の診断結果
              </h3>
              {latestSession.scoreProfiles.length > 0 ? (
                <>
                  {[...latestSession.scoreProfiles]
                    .sort((a, b) => b.standardizedScore - a.standardizedScore)
                    .slice(0, 3)
                    .map((sp) => {
                      const def = FACTOR_DEFINITIONS[sp.factorKey as keyof typeof FACTOR_DEFINITIONS];
                      return (
                        <div key={sp.factorKey} style={{ marginBottom: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                              marginBottom: "4px",
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{def?.labelJa ?? sp.factorKey}</span>
                            <span style={{ color: "#6366f1", fontWeight: 700 }}>
                              {sp.standardizedScore}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${sp.standardizedScore}%`,
                                background: def?.color ?? "#6366f1",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  <Link
                    href={`/results/${latestSession.id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: "#f1f5f9",
                      color: "#6366f1",
                      padding: "8px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      marginTop: "16px",
                    }}
                  >
                    詳細レポートを見る →
                  </Link>
                </>
              ) : (
                <p style={{ color: "#64748b" }}>結果を処理中です</p>
              )}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          <InfoCard
            icon="🔍"
            title="9つの診断因子"
            description="新規接点創出力・課題探索力・提案構築力など、営業活動に直結する9つの力を測定します。"
          />
          <InfoCard
            icon="🎭"
            title="8つの役割適性"
            description="ハンター型・ディスカバリー型など、あなたが最も力を発揮しやすい営業役割を特定します。"
          />
          <InfoCard
            icon="📈"
            title="育成アクション"
            description="今週から実践できる具体的なアクションと、上司が活かせる関わり方の提案を提供します。"
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px 24px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          background: `${color}15`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{label}</div>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>
          {value}
          <span style={{ fontSize: "0.9rem", marginLeft: "2px" }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px 24px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{icon}</div>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
