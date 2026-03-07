/**
 * Next.js Instrumentation
 * サーバー起動時（コールドスタート）に1回だけ実行される
 * Vercel Lambdaの各インスタンスでDBを自動初期化する
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDbInitialized } = await import("./lib/db-init");
    await ensureDbInitialized().catch((e) =>
      console.error("instrumentation: DB init failed", e)
    );
  }
}
