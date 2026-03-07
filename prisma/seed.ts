/**
 * シードファイル：デモ用の初期データを投入
 * 実行: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeScoreProfiles } from "../src/lib/scoring";
import { computeRoleFitScores } from "../src/lib/role-fit";
import { generateReport } from "../src/lib/report-generator";
import { LIKERT_QUESTIONS } from "../src/data/questions/likert";
import { FORCED_CHOICE_QUESTIONS } from "../src/data/questions/forced-choice";
import { SJT_QUESTIONS } from "../src/data/questions/sjt";
import type { ItemResponse } from "../src/types";

const prisma = new PrismaClient();

// デモメンバーのランダム回答を生成
function generateDemoResponses(seed: number): ItemResponse[] {
  const rng = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297 + 233) * 100000;
    return x - Math.floor(x);
  };

  const responses: ItemResponse[] = [];

  // Likert: 各設問に1-5の回答
  LIKERT_QUESTIONS.forEach((q, i) => {
    const raw = rng(i);
    let value: number;
    // seedごとに傾向を変える
    if (seed % 3 === 0) {
      // 新規開拓・クロージング強め
      if (q.factor === "opportunity_creation" || q.factor === "closing_drive") {
        value = raw < 0.3 ? 4 : raw < 0.7 ? 5 : 3;
      } else if (q.factor === "process_reliability" || q.factor === "emotional_regulation") {
        value = raw < 0.4 ? 2 : raw < 0.7 ? 3 : 4;
      } else {
        value = raw < 0.3 ? 3 : raw < 0.6 ? 4 : raw < 0.85 ? 5 : 2;
      }
    } else if (seed % 3 === 1) {
      // 課題探索・提案設計強め
      if (q.factor === "discovery" || q.factor === "solution_design") {
        value = raw < 0.2 ? 4 : raw < 0.7 ? 5 : 3;
      } else if (q.factor === "closing_drive" || q.factor === "opportunity_creation") {
        value = raw < 0.3 ? 2 : raw < 0.7 ? 3 : 4;
      } else {
        value = raw < 0.3 ? 3 : raw < 0.65 ? 4 : raw < 0.85 ? 5 : 2;
      }
    } else {
      // 関係構築・感情安定強め
      if (q.factor === "relationship_building" || q.factor === "emotional_regulation") {
        value = raw < 0.2 ? 4 : raw < 0.75 ? 5 : 3;
      } else if (q.factor === "closing_drive") {
        value = raw < 0.35 ? 2 : raw < 0.7 ? 3 : 4;
      } else {
        value = raw < 0.3 ? 3 : raw < 0.6 ? 4 : raw < 0.85 ? 5 : 2;
      }
    }
    responses.push({ questionId: q.id, questionType: "likert", responseValue: value });
  });

  // Forced-choice
  FORCED_CHOICE_QUESTIONS.forEach((q, i) => {
    const choice = rng(i + 100) < 0.55 ? "A" : "B";
    responses.push({
      questionId: q.id,
      questionType: "forced_choice",
      responseValue: choice,
    });
  });

  // SJT
  SJT_QUESTIONS.forEach((q, i) => {
    const r = rng(i + 200);
    const optKeys = q.options.map((o) => o.key);
    const choice = optKeys[Math.floor(r * optKeys.length)];
    responses.push({ questionId: q.id, questionType: "sjt", responseValue: choice });
  });

  return responses;
}

async function main() {
  console.log("🌱 シードデータ投入開始...");

  // チーム作成
  const team = await prisma.team.upsert({
    where: { id: "team-001" },
    update: {},
    create: { id: "team-001", name: "東京営業1部" },
  });

  // 管理者ユーザー
  const adminPw = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "user-admin-001",
      name: "山田 管理者",
      email: "admin@example.com",
      password: adminPw,
      role: "admin",
      teamId: team.id,
    },
  });

  // デモメンバー
  const members = [
    { id: "user-001", name: "田中 一郎", email: "tanaka@example.com", seed: 0 },
    { id: "user-002", name: "鈴木 花子", email: "suzuki@example.com", seed: 1 },
    { id: "user-003", name: "佐藤 健太", email: "sato@example.com", seed: 2 },
    { id: "user-004", name: "伊藤 美咲", email: "ito@example.com", seed: 3 },
    { id: "user-005", name: "渡辺 大輔", email: "watanabe@example.com", seed: 4 },
    { id: "user-006", name: "中村 さくら", email: "nakamura@example.com", seed: 5 },
  ];

  const memberPw = await bcrypt.hash("member123", 10);

  for (const member of members) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        id: member.id,
        name: member.name,
        email: member.email,
        password: memberPw,
        role: "member",
        teamId: team.id,
      },
    });

    // セッション作成（最初の4名は完了済み）
    if (member.seed < 4) {
      const sessionId = `session-${member.id}`;
      const existing = await prisma.assessmentSession.findFirst({
        where: { id: sessionId },
      });

      if (!existing) {
        const completedAt = new Date(Date.now() - (4 - member.seed) * 24 * 60 * 60 * 1000);
        const session = await prisma.assessmentSession.create({
          data: {
            id: sessionId,
            userId: user.id,
            status: "completed",
            completedAt,
          },
        });

        const responses = generateDemoResponses(member.seed);

        // 回答保存
        await prisma.itemResponse.createMany({
          data: responses.map((r) => ({
            sessionId: session.id,
            questionId: r.questionId,
            questionType: r.questionType,
            responseValue: String(r.responseValue),
          })),
        });

        // スコア計算
        const scoreProfiles = computeScoreProfiles(responses);
        const roleFitResults = computeRoleFitScores(scoreProfiles);
        const report = generateReport(scoreProfiles, roleFitResults);

        await prisma.scoreProfile.createMany({
          data: scoreProfiles.map((sp) => ({
            sessionId: session.id,
            factorKey: sp.factorKey,
            rawScore: sp.rawScore,
            standardizedScore: sp.standardizedScore,
          })),
        });

        await prisma.roleFitResult.createMany({
          data: roleFitResults.map((rf) => ({
            sessionId: session.id,
            roleKey: rf.roleKey,
            fitScore: rf.fitScore,
            rank: rf.rank,
          })),
        });

        const recs = [
          { type: "style", content: report.salesStyle, priority: 1 },
          { type: "manager_tip", content: report.managerTips, priority: 2 },
          { type: "action", content: report.weeklyActions.join("\n"), priority: 3 },
          { type: "development", content: report.developmentPlan, priority: 4 },
          { type: "team", content: report.teamComplement, priority: 5 },
          { type: "risk", content: report.overuseWarning, priority: 6 },
        ];

        await prisma.developmentRecommendation.createMany({
          data: recs.map((r) => ({ ...r, sessionId: session.id })),
        });

        console.log(`  ✓ ${member.name} の診断結果を生成`);
      } else {
        console.log(`  - ${member.name} は既に存在します`);
      }
    } else {
      console.log(`  ✓ ${member.name} を登録（未受検）`);
    }
  }

  console.log("✅ シードデータ投入完了！");
  console.log("---");
  console.log("管理者ログイン: admin@example.com / admin123");
  console.log("メンバーログイン: tanaka@example.com / member123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
