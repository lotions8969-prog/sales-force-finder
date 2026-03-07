import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import StartAssessmentButton from "./StartAssessmentButton";

export default async function AssessmentStartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
        }}
      >
        <Link
          href="/dashboard"
          style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none", fontSize: "1.1rem" }}
        >
          ← ダッシュボードへ
        </Link>
        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>{session.user.name}</span>
      </header>

      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "48px 40px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎯</div>
          <h1
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}
          >
            営業強み診断
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 auto 32px",
            }}
          >
            あなたの営業上の強み・弱みを多角的に測定します。
            結果をもとに、最適な営業役割と具体的な育成アクションを提案します。
          </p>

          {/* 診断の流れ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "40px",
              textAlign: "left",
            }}
          >
            <SectionCard
              step="1"
              icon="📋"
              title="Likert形式"
              desc="45問｜日常の行動傾向を5段階で評価"
              color="#6366f1"
            />
            <SectionCard
              step="2"
              icon="⚖️"
              title="比較選択"
              desc="12問｜2つの傾向のうち、より自分らしい方を選択"
              color="#8b5cf6"
            />
            <SectionCard
              step="3"
              icon="🏢"
              title="営業シナリオ"
              desc="8問｜実際の営業場面での判断を選択"
              color="#a855f7"
            />
          </div>

          {/* 注意事項 */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "32px",
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#374151" }}>注意事項：</strong>
              <br />
              ・「正解」はありません。日頃の自分の行動に最も近いものを選んでください。
              <br />
              ・所要時間は15〜20分程度です。一度に完了することを推奨します。
              <br />
              ・結果はマネージャーが閲覧できます。育成・配置の参考にのみ使用されます。
              <br />
              ・採用選考・評価には使用されません。
            </p>
          </div>

          <StartAssessmentButton />
        </div>
      </main>
    </div>
  );
}

function SectionCard({
  step,
  icon,
  title,
  desc,
  color,
}: {
  step: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          background: color,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "0.8rem",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {step}
      </div>
      <div style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{title}</div>
      <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px", lineHeight: 1.5 }}>
        {desc}
      </div>
    </div>
  );
}
