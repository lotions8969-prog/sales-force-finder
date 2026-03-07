"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "メールアドレスまたはパスワードが正しくありません。"
            : `ログインに失敗しました: ${result.error}`
        );
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("予期しないエラーが発生しました。再度お試しください。");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("通信エラーが発生しました。ページを再読み込みしてお試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo/Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
            }}
          >
            📊
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            営業強み診断
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "0.9rem" }}>
            Sales Force Finder
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#dc2626",
                fontSize: "0.875rem",
                marginBottom: "16px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading
                ? "#a5b4fc"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        {/* デモアカウント情報 */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            background: "#f8fafc",
            borderRadius: "8px",
            fontSize: "0.8rem",
            color: "#64748b",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "#374151" }}>デモアカウント</strong>
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <DemoButton
              label="管理者でログイン"
              email="admin@example.com"
              password="admin123"
              color="#6366f1"
              onSelect={(e, p) => { setEmail(e); setPassword(p); }}
            />
            <DemoButton
              label="メンバーでログイン"
              email="tanaka@example.com"
              password="member123"
              color="#22c55e"
              onSelect={(e, p) => { setEmail(e); setPassword(p); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoButton({
  label,
  email,
  password,
  color,
  onSelect,
}: {
  label: string;
  email: string;
  password: string;
  color: string;
  onSelect: (email: string, password: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(email, password)}
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: "6px",
        padding: "8px 12px",
        textAlign: "left",
        cursor: "pointer",
        fontSize: "0.78rem",
        color: "#374151",
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontWeight: 600, color }}>{label}</span>
      <br />
      {email} / {password}
    </button>
  );
}
