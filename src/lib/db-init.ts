/**
 * DB初期化ユーティリティ
 * Vercel/サーバーレス環境でSQLiteスキーマとデモデータを自動作成する
 */

import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

let initialized = false;

export async function ensureDbInitialized() {
  if (initialized) return;

  try {
    // テーブルが存在するか確認
    await prisma.$queryRawUnsafe("SELECT 1 FROM users LIMIT 1");
    initialized = true;
  } catch {
    // テーブルが存在しない → スキーマを生SQLで作成
    try {
      await createSchema();
      await seedDemoData();
      initialized = true;
    } catch (e) {
      console.error("DB initialization failed:", e);
    }
  }
}

async function createSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "teams" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'member',
      "teamId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "assessment_sessions" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'in_progress',
      "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "completedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "item_responses" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL,
      "questionId" TEXT NOT NULL,
      "questionType" TEXT NOT NULL,
      "responseValue" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "score_profiles" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL,
      "factorKey" TEXT NOT NULL,
      "rawScore" REAL NOT NULL,
      "standardizedScore" REAL NOT NULL,
      "percentile" REAL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("sessionId", "factorKey")
    )`,
    `CREATE TABLE IF NOT EXISTS "role_fit_results" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL,
      "roleKey" TEXT NOT NULL,
      "fitScore" REAL NOT NULL,
      "rank" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("sessionId", "roleKey")
    )`,
    `CREATE TABLE IF NOT EXISTS "development_recommendations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "priority" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("✓ Schema created");
}

async function seedDemoData() {
  const adminPw = await bcrypt.hash("admin123", 10);
  const memberPw = await bcrypt.hash("member123", 10);
  const teamId = randomUUID();
  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO teams (id, name, createdAt) VALUES (?, ?, ?)`,
    teamId, "東京営業1部", now
  );

  await prisma.$executeRawUnsafe(
    `INSERT OR IGNORE INTO users (id, name, email, password, role, teamId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    randomUUID(), "山田 管理者", "admin@example.com", adminPw, "admin", teamId, now, now
  );

  const members = [
    ["田中 一郎", "tanaka@example.com"],
    ["鈴木 花子", "suzuki@example.com"],
    ["佐藤 健太", "sato@example.com"],
    ["渡辺 大輔", "watanabe@example.com"],
  ];

  for (const [name, email] of members) {
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO users (id, name, email, password, role, teamId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(), name, email, memberPw, "member", teamId, now, now
    );
  }
  console.log("✓ Demo data seeded");
}
