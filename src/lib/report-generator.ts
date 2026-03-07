/**
 * lib/report-generator.ts
 * 診断レポート文章生成ロジック（LLMなし版）
 * 将来的にClaude APIを使って文章を生成できるよう拡張しやすい設計
 */

import type { FactorKey, RoleKey, ScoreProfile, RoleFitResult } from "@/types";
import { FACTOR_DEFINITIONS } from "@/data/factor-definitions";
import { ROLE_DEFINITIONS } from "@/data/role-definitions";
import {
  getTopStrengths,
  getGrowthAreas,
  getOveruseRisks,
} from "./scoring";
import { getTopRoles } from "./role-fit";

export interface ReportOutput {
  topStrengths: FactorKey[];
  growthAreas: FactorKey[];
  overuseRisks: FactorKey[];
  topRoles: RoleFitResult[];
  salesStyle: string;
  managerTips: string;
  weeklyActions: string[];
  developmentPlan: string;
  teamComplement: string;
  overuseWarning: string;
}

/**
 * 上位強みの組み合わせから推奨営業スタイルを生成
 */
function generateSalesStyle(topStrengths: FactorKey[], topRoles: RoleFitResult[]): string {
  const top1 = topStrengths[0];
  const top2 = topStrengths[1];
  const topRole = topRoles[0]?.roleKey;

  const styleMap: Partial<Record<FactorKey, string>> = {
    opportunity_creation:
      "積極的な行動量と新規開拓への挑戦を武器に、ゼロから関係を築くスタイル。",
    discovery:
      "顧客の言葉に耳を傾け、本質的な課題を引き出すことで信頼を積み重ねるスタイル。",
    solution_design:
      "顧客課題を丁寧に整理し、論理的に組み立てた提案で価値を伝えるスタイル。",
    influence:
      "相手の心理を読みながら論理と感情の両面から説得し、決断を引き出すスタイル。",
    closing_drive:
      "商談の節目で次のステップを明確に提案し、スピード感を持って前進させるスタイル。",
    relationship_building:
      "長期的な信頼関係を基盤に、顧客から選ばれ続けることを目指すスタイル。",
    process_reliability:
      "抜け漏れのない丁寧な対応と確実なフォローで、顧客に安心感を与えるスタイル。",
    learning_agility:
      "失敗や変化から素早く学び、常に営業スタイルをアップデートし続けるスタイル。",
    emotional_regulation:
      "どんな状況でも冷静さを保ち、安定した判断と行動で顧客の信頼を得るスタイル。",
  };

  const base = styleMap[top1] ?? "バランスのとれた営業スタイル。";

  if (top2 && top1 !== top2) {
    const sub = FACTOR_DEFINITIONS[top2].labelJa;
    return `${base}さらに「${sub}」も高く、${FACTOR_DEFINITIONS[top2].highDescription}`;
  }
  return base;
}

/**
 * 上司向けの関わり方を生成
 */
function generateManagerTips(
  topStrengths: FactorKey[],
  growthAreas: FactorKey[]
): string {
  const strength = FACTOR_DEFINITIONS[topStrengths[0]];
  const growth = FACTOR_DEFINITIONS[growthAreas[0]];

  return (
    `【強みの活かし方】${strength.labelJa}が特に高いため、` +
    `${strength.highDescription}この強みが発揮できる役割（新規アプローチ、課題ヒアリング、提案設計など）を積極的に担わせることで、` +
    `パフォーマンスが最大化します。\n\n` +
    `【育成の注意点】一方で「${growth.labelJa}」については意識的なサポートが効果的です。` +
    `日常の商談や振り返りを通じて、具体的なフィードバックを与えながら成長を促しましょう。`
  );
}

/**
 * 今週から実践すべき3つのアクションを生成
 */
function generateWeeklyActions(
  topStrengths: FactorKey[],
  growthAreas: FactorKey[]
): string[] {
  const actions: Record<FactorKey, string> = {
    opportunity_creation:
      "今週、新規アプローチリストを5件作成し、うち3件に実際にアプローチしてみる。",
    discovery:
      "次の商談では「なぜ？」を3回以上使って、課題の根本を深掘りする練習をする。",
    solution_design:
      "提案書を顧客の立場で読み返し、「この提案が顧客の課題にどう答えているか」を一文で書き出す。",
    influence:
      "商談での反論に対し、すぐに折れずにロジックで1回以上カウンターする練習をする。",
    closing_drive:
      "今週の商談で必ず「次のステップをいつ確認しますか？」という質問を1回行う。",
    relationship_building:
      "担当顧客1社に、業務と関係のない話題（業界ニュース等）を添えた連絡をしてみる。",
    process_reliability:
      "今週の全案件の進捗をCRM・ノートに入力し、金曜に抜け漏れがないか確認する習慣をつける。",
    learning_agility:
      "今週の商談を1件振り返り「次回は何を変えるか」を3箇条でメモする。",
    emotional_regulation:
      "厳しい顧客対応の後、5分間だけ深呼吸・気分転換の時間を設けるルーティンを試す。",
  };

  const result: string[] = [];

  // 最大の強みを活かすアクション
  const strengthAction = actions[topStrengths[0]];
  if (strengthAction) result.push(`【強みを活かす】${strengthAction}`);

  // 成長領域の改善アクション
  const growthAction = actions[growthAreas[0]];
  if (growthAction) result.push(`【成長領域】${growthAction}`);

  // 2番目の成長領域
  if (growthAreas[1]) {
    const growthAction2 = actions[growthAreas[1]];
    if (growthAction2) result.push(`【意識改善】${growthAction2}`);
  }

  return result;
}

/**
 * 育成施策を生成
 */
function generateDevelopmentPlan(
  topStrengths: FactorKey[],
  growthAreas: FactorKey[],
  topRoles: RoleFitResult[]
): string {
  const topRole = ROLE_DEFINITIONS[topRoles[0]?.roleKey];
  const growth = FACTOR_DEFINITIONS[growthAreas[0]];

  if (!topRole) return "個別の育成プランを上司と相談して設定してください。";

  const hints = topRole.developmentHints.join("・");

  return (
    `【推奨役割への最適化】適性の高い「${topRole.labelJa}」としての育成を優先することで、` +
    `強みが最大限に発揮されます。具体的な施策：${hints}。\n\n` +
    `【成長領域の強化】「${growth.labelJa}」については、` +
    `${growth.description}` +
    `日常の営業活動の中で意識的に練習機会を設けることが効果的です。`
  );
}

/**
 * チーム内補完関係の示唆を生成
 */
function generateTeamComplement(topStrengths: FactorKey[], growthAreas: FactorKey[]): string {
  const strength = FACTOR_DEFINITIONS[topStrengths[0]].labelJa;
  const growth = FACTOR_DEFINITIONS[growthAreas[0]].labelJa;

  return (
    `「${strength}」が高いメンバーとして、チーム内でその役割を担える場面で積極的に貢献できます。` +
    `一方で「${growth}」が強いメンバーと組むことで、お互いの弱みを補い合う補完関係が生まれます。` +
    `ペア営業や案件の役割分担の際に、この観点を活用してみてください。`
  );
}

/**
 * 過剰使用リスクの説明を生成
 */
function generateOveruseWarning(overuseRisks: FactorKey[]): string {
  if (overuseRisks.length === 0) {
    return "現時点では特定の強みが突出しすぎているリスクは見られません。引き続きバランスを意識して活動してください。";
  }

  const warnings = overuseRisks
    .map((factor) => {
      const def = FACTOR_DEFINITIONS[factor];
      return `・【${def.labelJa}】${def.overuseRisk}`;
    })
    .join("\n");

  return `以下の強みは特に高いスコアが出ています。強みとして活用しながら、過剰使用には注意してください：\n${warnings}`;
}

/**
 * メインのレポート生成関数
 */
export function generateReport(
  profiles: ScoreProfile[],
  roleFitResults: RoleFitResult[]
): ReportOutput {
  const topStrengths = getTopStrengths(profiles, 5);
  const growthAreas = getGrowthAreas(profiles, 3);
  const overuseRisks = getOveruseRisks(profiles, 85);
  const topRoles = getTopRoles(roleFitResults, 3);

  return {
    topStrengths,
    growthAreas,
    overuseRisks,
    topRoles,
    salesStyle: generateSalesStyle(topStrengths, topRoles),
    managerTips: generateManagerTips(topStrengths, growthAreas),
    weeklyActions: generateWeeklyActions(topStrengths, growthAreas),
    developmentPlan: generateDevelopmentPlan(topStrengths, growthAreas, topRoles),
    teamComplement: generateTeamComplement(topStrengths, growthAreas),
    overuseWarning: generateOveruseWarning(overuseRisks),
  };
}
