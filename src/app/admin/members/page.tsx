import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminMembersPage() {
  await ensureDbInitialized().catch(() => null);
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: "member" },
    include: {
      sessions: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
        include: {
          scoreProfiles: true,
          roleFitResults: { orderBy: { rank: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

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
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none", fontSize: "1.1rem" }}>
            📊 営業強み診断
          </Link>
          <Link href="/admin/members" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem", borderBottom: "2px solid #6366f1", paddingBottom: "2px" }}>
            メンバー管理
          </Link>
          <Link href="/admin/team" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>
            チーム分析
          </Link>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/api/admin/export"
            style={{
              background: "#f1f5f9",
              color: "#374151",
              padding: "8px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            📥 全件CSVエクスポート
          </Link>
          <Link
            href="/api/users"
            style={{
              background: "#6366f1",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            + メンバー追加
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            メンバー一覧
          </h1>
          <p style={{ color: "#64748b", marginTop: "4px", fontSize: "0.9rem" }}>
            {users.length}名のメンバー |{" "}
            {users.filter((u) => u.sessions.length > 0).length}名が診断完了
          </p>
        </div>

        {/* Table */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {["氏名", "メール", "診断状況", "上位役割", "操作"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "14px 20px",
                      fontSize: "0.8rem",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const latestSession = user.sessions[0];
                const topRole = latestSession?.roleFitResults[0];
                const roleLabel = topRole
                  ? getRoleLabel(topRole.roleKey)
                  : null;

                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            background: "#6366f115",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "#6366f1",
                            fontSize: "0.9rem",
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "0.85rem", color: "#64748b" }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {latestSession ? (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#16a34a",
                            padding: "3px 10px",
                            borderRadius: "9999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          ✓ 完了
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#d97706",
                            padding: "3px 10px",
                            borderRadius: "9999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          未受検
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {roleLabel ? (
                        <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                          {roleLabel}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {latestSession ? (
                        <Link
                          href={`/results/${latestSession.id}`}
                          style={{
                            color: "#6366f1",
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          結果を見る →
                        </Link>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
              <p>メンバーがいません。メンバーを追加してください。</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getRoleLabel(roleKey: string): string {
  const map: Record<string, string> = {
    hunter: "🎯 ハンター型",
    discovery_specialist: "🔍 ディスカバリー型",
    solution_designer: "📐 提案設計型",
    closer: "🏁 クロージング型",
    account_developer: "🌱 アカウント育成型",
    relationship_builder: "🤝 関係構築型",
    process_operator: "⚙️ 再現性運用型",
    next_leader: "⭐ 次世代リーダー候補型",
  };
  return map[roleKey] ?? roleKey;
}
