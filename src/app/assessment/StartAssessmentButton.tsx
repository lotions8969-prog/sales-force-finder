"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartAssessmentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assessment/start", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        setLoading(false);
        return;
      }

      router.push(`/assessment/${data.sessionId}`);
    } catch {
      setError("通信エラーが発生しました。再度お試しください。");
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p style={{ color: "#dc2626", marginBottom: "12px", fontSize: "0.875rem" }}>{error}</p>
      )}
      <button
        onClick={handleStart}
        disabled={loading}
        style={{
          background: loading
            ? "#a5b4fc"
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          padding: "14px 48px",
          borderRadius: "10px",
          fontSize: "1.05rem",
          fontWeight: 700,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
        }}
      >
        {loading ? "準備中..." : "診断を開始する →"}
      </button>
      <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "12px" }}>
        所要時間：約15〜20分 | 65問
      </p>
    </div>
  );
}
