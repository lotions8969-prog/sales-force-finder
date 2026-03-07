"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LIKERT_QUESTIONS } from "@/data/questions/likert";
import { FORCED_CHOICE_QUESTIONS } from "@/data/questions/forced-choice";
import { SJT_QUESTIONS } from "@/data/questions/sjt";
import type { ItemResponse } from "@/types";

type Section = "intro_fc" | "intro_sjt" | "likert" | "forced_choice" | "sjt";

const TOTAL_QUESTIONS =
  LIKERT_QUESTIONS.length + FORCED_CHOICE_QUESTIONS.length + SJT_QUESTIONS.length;

export default function AssessmentClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("likert");
  const [likertIndex, setLikertIndex] = useState(0);
  const [fcIndex, setFcIndex] = useState(0);
  const [sjtIndex, setSjtIndex] = useState(0);
  const [responses, setResponses] = useState<ItemResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = responses.length;
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  const addResponse = useCallback(
    (response: ItemResponse) => {
      setResponses((prev) => {
        const exists = prev.findIndex((r) => r.questionId === response.questionId);
        if (exists >= 0) {
          const next = [...prev];
          next[exists] = response;
          return next;
        }
        return [...prev, response];
      });
    },
    []
  );

  const handleLikertAnswer = (value: number) => {
    const q = LIKERT_QUESTIONS[likertIndex];
    addResponse({ questionId: q.id, questionType: "likert", responseValue: value });

    if (likertIndex + 1 < LIKERT_QUESTIONS.length) {
      setLikertIndex(likertIndex + 1);
    } else {
      setSection("intro_fc");
    }
  };

  const handleFCAnswer = (choice: "A" | "B") => {
    const q = FORCED_CHOICE_QUESTIONS[fcIndex];
    addResponse({ questionId: q.id, questionType: "forced_choice", responseValue: choice });

    if (fcIndex + 1 < FORCED_CHOICE_QUESTIONS.length) {
      setFcIndex(fcIndex + 1);
    } else {
      setSection("intro_sjt");
    }
  };

  const handleSJTAnswer = async (choice: string) => {
    const q = SJT_QUESTIONS[sjtIndex];
    const newResponse: ItemResponse = {
      questionId: q.id,
      questionType: "sjt",
      responseValue: choice,
    };
    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    if (sjtIndex + 1 < SJT_QUESTIONS.length) {
      setSjtIndex(sjtIndex + 1);
    } else {
      // 全設問完了 → 送信
      await submitResponses(newResponses);
    }
  };

  const submitResponses = async (finalResponses: ItemResponse[]) => {
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/assessment/${sessionId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: finalResponses }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "送信中にエラーが発生しました");
      setSubmitting(false);
      return;
    }

    router.push(`/results/${sessionId}`);
  };

  if (submitting) {
    return (
      <CenteredLayout>
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚙️</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a" }}>
            診断結果を分析中...
          </h2>
          <p style={{ color: "#64748b", marginTop: "8px" }}>しばらくお待ちください</p>
        </div>
      </CenteredLayout>
    );
  }

  // セクション間のトランジション画面
  if (section === "intro_fc") {
    return (
      <CenteredLayout>
        <TransitionScreen
          icon="⚖️"
          stepNum={2}
          title="セクション2：比較選択"
          desc="2つの営業スタイルの説明が表示されます。どちらが「より自分らしい」かを選んでください。どちらか一方だけを選ぶ形式です。"
          total={FORCED_CHOICE_QUESTIONS.length}
          onStart={() => setSection("forced_choice")}
          color="#8b5cf6"
        />
      </CenteredLayout>
    );
  }

  if (section === "intro_sjt") {
    return (
      <CenteredLayout>
        <TransitionScreen
          icon="🏢"
          stepNum={3}
          title="セクション3：営業シナリオ"
          desc="実際の営業場面を想定したシナリオが出ます。4つの選択肢の中から、あなたが最も取りそうな行動を1つ選んでください。"
          total={SJT_QUESTIONS.length}
          onStart={() => setSection("sjt")}
          color="#a855f7"
        />
      </CenteredLayout>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Progress Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "16px 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontWeight: 700, color: "#6366f1", fontSize: "0.9rem", flexShrink: 0 }}>
            営業強み診断
          </span>
          <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "9999px" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                borderRadius: "9999px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span style={{ fontSize: "0.85rem", color: "#64748b", flexShrink: 0 }}>
            {answeredCount} / {TOTAL_QUESTIONS}問
          </span>
        </div>
      </div>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px" }}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#dc2626",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {section === "likert" && (
          <LikertSection
            question={LIKERT_QUESTIONS[likertIndex]}
            index={likertIndex}
            total={LIKERT_QUESTIONS.length}
            currentValue={
              responses.find((r) => r.questionId === LIKERT_QUESTIONS[likertIndex].id)
                ?.responseValue as number | undefined
            }
            onAnswer={handleLikertAnswer}
          />
        )}

        {section === "forced_choice" && (
          <ForcedChoiceSection
            question={FORCED_CHOICE_QUESTIONS[fcIndex]}
            index={fcIndex}
            total={FORCED_CHOICE_QUESTIONS.length}
            onAnswer={handleFCAnswer}
          />
        )}

        {section === "sjt" && (
          <SJTSection
            question={SJT_QUESTIONS[sjtIndex]}
            index={sjtIndex}
            total={SJT_QUESTIONS.length}
            onAnswer={handleSJTAnswer}
          />
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

function CenteredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "48px 40px",
          maxWidth: "560px",
          width: "100%",
          border: "1px solid #e2e8f0",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TransitionScreen({
  icon,
  stepNum,
  title,
  desc,
  total,
  onStart,
  color,
}: {
  icon: string;
  stepNum: number;
  title: string;
  desc: string;
  total: number;
  onStart: () => void;
  color: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{icon}</div>
      <div
        style={{
          display: "inline-block",
          background: `${color}15`,
          color,
          padding: "4px 14px",
          borderRadius: "9999px",
          fontSize: "0.8rem",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        STEP {stepNum} / 3
      </div>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
        {title}
      </h2>
      <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: "8px" }}>{desc}</p>
      <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "28px" }}>
        全{total}問
      </p>
      <button
        onClick={onStart}
        style={{
          background: color,
          color: "white",
          padding: "12px 36px",
          borderRadius: "10px",
          fontSize: "1rem",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
        }}
      >
        次のセクションへ →
      </button>
    </div>
  );
}

function LikertSection({
  question,
  index,
  total,
  currentValue,
  onAnswer,
}: {
  question: (typeof LIKERT_QUESTIONS)[number];
  index: number;
  total: number;
  currentValue?: number;
  onAnswer: (v: number) => void;
}) {
  const labels = [
    "まったく\nそうでない",
    "あまり\nそうでない",
    "どちらとも\nいえない",
    "ややそうだ",
    "非常に\nそうだ",
  ];

  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            background: "#6366f115",
            color: "#6366f1",
            padding: "3px 12px",
            borderRadius: "9999px",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}
        >
          STEP 1 — 日常行動チェック
        </span>
      </div>
      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "20px" }}>
        問 {index + 1} / {total}
      </p>
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          padding: "32px",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#0f172a",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {question.text}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
        }}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onAnswer(v)}
            style={{
              padding: "14px 8px",
              borderRadius: "10px",
              border: currentValue === v ? "2.5px solid #6366f1" : "1.5px solid #e2e8f0",
              background: currentValue === v ? "#6366f115" : "white",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: currentValue === v ? "#6366f1" : "#374151",
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#94a3b8",
                whiteSpace: "pre-wrap",
                lineHeight: 1.3,
                marginTop: "4px",
              }}
            >
              {labels[v - 1]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ForcedChoiceSection({
  question,
  index,
  total,
  onAnswer,
}: {
  question: (typeof FORCED_CHOICE_QUESTIONS)[number];
  index: number;
  total: number;
  onAnswer: (v: "A" | "B") => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            background: "#8b5cf615",
            color: "#8b5cf6",
            padding: "3px 12px",
            borderRadius: "9999px",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}
        >
          STEP 2 — 比較選択
        </span>
      </div>
      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "20px" }}>
        問 {index + 1} / {total}
      </p>
      <p
        style={{
          fontSize: "0.95rem",
          color: "#374151",
          marginBottom: "20px",
          fontWeight: 500,
        }}
      >
        次の2つのうち、あなたに「より当てはまる」のはどちらですか？
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {(["A", "B"] as const).map((key) => {
          const opt = key === "A" ? question.optionA : question.optionB;
          return (
            <button
              key={key}
              onClick={() => onAnswer(key)}
              style={{
                background: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px 24px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#8b5cf6";
                (e.currentTarget as HTMLButtonElement).style.background = "#8b5cf608";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLButtonElement).style.background = "white";
              }}
            >
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  background: "#8b5cf615",
                  color: "#8b5cf6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {key}
              </span>
              <span style={{ fontSize: "0.95rem", color: "#0f172a", lineHeight: 1.6 }}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SJTSection({
  question,
  index,
  total,
  onAnswer,
}: {
  question: (typeof SJT_QUESTIONS)[number];
  index: number;
  total: number;
  onAnswer: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            background: "#a855f715",
            color: "#a855f7",
            padding: "3px 12px",
            borderRadius: "9999px",
            fontSize: "0.78rem",
            fontWeight: 600,
          }}
        >
          STEP 3 — 営業シナリオ
        </span>
      </div>
      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "20px" }}>
        シナリオ {index + 1} / {total}
      </p>

      {/* Scenario */}
      <div
        style={{
          background: "#faf5ff",
          border: "1px solid #e9d5ff",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "0.85rem",
            color: "#7c3aed",
            fontWeight: 600,
            marginBottom: "6px",
          }}
        >
          【状況】
        </p>
        <p style={{ fontSize: "1rem", color: "#1e1b4b", lineHeight: 1.7, margin: 0 }}>
          {question.scenario}
        </p>
      </div>

      <p style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 500, marginBottom: "12px" }}>
        あなたが最も取りそうな行動はどれですか？
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {question.options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.key)}
            style={{
              background: "white",
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px 20px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#a855f7";
              (e.currentTarget as HTMLButtonElement).style.background = "#a855f708";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                background: "#a855f715",
                color: "#a855f7",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                flexShrink: 0,
                marginTop: "1px",
              }}
            >
              {opt.key}
            </span>
            <span style={{ fontSize: "0.92rem", color: "#0f172a", lineHeight: 1.65 }}>
              {opt.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
