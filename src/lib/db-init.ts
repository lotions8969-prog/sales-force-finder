/**
 * Vercel環境でのDB初期化ユーティリティ
 * SQLiteはサーバーレス環境では /tmp に置く必要がある
 * 初回リクエスト時にテーブルを作成し、デモデータを投入する
 */

import { prisma } from "./db";
import bcrypt from "bcryptjs";

let initialized = false;

export async function ensureDbInitialized() {
  if (initialized) return;

  try {
    // テーブルが存在するか確認
    await prisma.user.count();
    initialized = true;
  } catch {
    // テーブルが存在しない場合は初期化
    try {
      await initializeDb();
      initialized = true;
    } catch (e) {
      console.error("DB initialization failed:", e);
    }
  }
}

async function initializeDb() {
  // 管理者ユーザーが既に存在するか確認
  const adminExists = await prisma.user
    .findUnique({ where: { email: "admin@example.com" } })
    .catch(() => null);

  if (adminExists) {
    initialized = true;
    return;
  }

  const adminPw = await bcrypt.hash("admin123", 10);
  const memberPw = await bcrypt.hash("member123", 10);

  const team = await prisma.team.create({
    data: { name: "東京営業1部" },
  });

  await prisma.user.create({
    data: {
      name: "山田 管理者",
      email: "admin@example.com",
      password: adminPw,
      role: "admin",
      teamId: team.id,
    },
  });

  const memberNames = [
    { name: "田中 一郎", email: "tanaka@example.com" },
    { name: "鈴木 花子", email: "suzuki@example.com" },
    { name: "佐藤 健太", email: "sato@example.com" },
    { name: "渡辺 大輔", email: "watanabe@example.com" },
  ];

  for (const m of memberNames) {
    await prisma.user.create({
      data: { ...m, password: memberPw, role: "member", teamId: team.id },
    }).catch(() => null);
  }
}
