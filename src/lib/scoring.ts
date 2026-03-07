/**
 * lib/scoring.ts
 * 純粋関数によるスコアリングロジック
 * 決定論的で再現可能な実装
 */

import type { FactorKey, ItemResponse, ScoreProfile } from "@/types";
import { LIKERT_QUESTIONS } from "@/data/questions/likert";
import { FORCED_CHOICE_QUESTIONS } from "@/data/questions/forced-choice";
import { SJT_QUESTIONS } from "@/data/questions/sjt";
import { FACTOR_KEYS } from "@/data/factor-definitions";

// 各因子の理論上最大スコア（正規化に使用）
const MAX_FACTOR_SCORES: Record<FactorKey, number> = {
  opportunity_creation: 0,
  discovery: 0,
  solution_design: 0,
  influence: 0,
  closing_drive: 0,
  relationship_building: 0,
  process_reliability: 0,
  learning_agility: 0,
  emotional_regulation: 0,
};

// Likertの最大スコアを計算（5点 × 正順項目 + 5点 × 逆転項目 = 5×5=25）
function computeMaxScores(): Record<FactorKey, number> {
  const maxScores = { ...MAX_FACTOR_SCORES };

  // Likert: 各設問で最大5点（重み考慮）
  for (const q of LIKERT_QUESTIONS) {
    maxScores[q.factor] += 5 * q.weight;
  }

  // Forced-choice: 各ブロックで選択側に重みポイント
  for (const q of FORCED_CHOICE_QUESTIONS) {
    maxScores[q.optionA.factor] += q.optionA.weight;
    maxScores[q.optionB.factor] += q.optionB.weight;
  }

  // SJT: 各設問で最大スコアの選択肢を想定
  for (const q of SJT_QUESTIONS) {
    const factorMaxes: Partial<Record<FactorKey, number>> = {};
    for (const opt of q.options) {
      for (const [factor, score] of Object.entries(opt.scores) as [FactorKey, number][]) {
        factorMaxes[factor] = Math.max(factorMaxes[factor] ?? 0, score);
      }
    }
    for (const [factor, score] of Object.entries(factorMaxes) as [FactorKey, number][]) {
      maxScores[factor] += score;
    }
  }

  return maxScores;
}

const THEORETICAL_MAX_SCORES = computeMaxScores();

/**
 * Likert設問のスコアを計算
 */
function scoreLikert(responses: ItemResponse[]): Partial<Record<FactorKey, number>> {
  const scores: Partial<Record<FactorKey, number>> = {};

  const likertResponses = responses.filter((r) => r.questionType === "likert");

  for (const response of likertResponses) {
    const question = LIKERT_QUESTIONS.find((q) => q.id === response.questionId);
    if (!question) continue;

    let value = Number(response.responseValue);
    if (isNaN(value) || value < 1 || value > 5) continue;

    // 逆転項目の処理
    if (question.reversed) {
      value = 6 - value;
    }

    const factor = question.factor;
    scores[factor] = (scores[factor] ?? 0) + value * question.weight;
  }

  return scores;
}

/**
 * Forced-choice設問のスコアを計算
 */
function scoreForcedChoice(responses: ItemResponse[]): Partial<Record<FactorKey, number>> {
  const scores: Partial<Record<FactorKey, number>> = {};

  const fcResponses = responses.filter((r) => r.questionType === "forced_choice");

  for (const response of fcResponses) {
    const question = FORCED_CHOICE_QUESTIONS.find((q) => q.id === response.questionId);
    if (!question) continue;

    const choice = String(response.responseValue);
    if (choice === "A") {
      const factor = question.optionA.factor;
      scores[factor] = (scores[factor] ?? 0) + question.optionA.weight;
    } else if (choice === "B") {
      const factor = question.optionB.factor;
      scores[factor] = (scores[factor] ?? 0) + question.optionB.weight;
    }
  }

  return scores;
}

/**
 * SJT設問のスコアを計算
 */
function scoreSJT(responses: ItemResponse[]): Partial<Record<FactorKey, number>> {
  const scores: Partial<Record<FactorKey, number>> = {};

  const sjtResponses = responses.filter((r) => r.questionType === "sjt");

  for (const response of sjtResponses) {
    const question = SJT_QUESTIONS.find((q) => q.id === response.questionId);
    if (!question) continue;

    const choice = String(response.responseValue);
    const selectedOption = question.options.find((opt) => opt.key === choice);
    if (!selectedOption) continue;

    for (const [factor, score] of Object.entries(selectedOption.scores) as [FactorKey, number][]) {
      scores[factor] = (scores[factor] ?? 0) + score;
    }
  }

  return scores;
}

/**
 * Raw スコアを 0-100 の標準化スコアに変換
 */
function standardize(rawScore: number, maxScore: number): number {
  if (maxScore === 0) return 50;
  const normalized = (rawScore / maxScore) * 100;
  return Math.round(Math.min(100, Math.max(0, normalized)));
}

/**
 * メインスコアリング関数
 * @param responses すべての回答
 * @returns 各因子のスコアプロファイル
 */
export function computeScoreProfiles(responses: ItemResponse[]): ScoreProfile[] {
  // 各セクションのスコアを計算
  const likertScores = scoreLikert(responses);
  const fcScores = scoreForcedChoice(responses);
  const sjtScores = scoreSJT(responses);

  // 因子ごとに合算
  const rawScores: Record<FactorKey, number> = {} as Record<FactorKey, number>;
  for (const factor of FACTOR_KEYS) {
    rawScores[factor] =
      (likertScores[factor] ?? 0) +
      (fcScores[factor] ?? 0) +
      (sjtScores[factor] ?? 0);
  }

  // 標準化スコアに変換
  const profiles: ScoreProfile[] = FACTOR_KEYS.map((factor) => ({
    factorKey: factor,
    rawScore: rawScores[factor],
    standardizedScore: standardize(rawScores[factor], THEORETICAL_MAX_SCORES[factor]),
  }));

  return profiles;
}

/**
 * 上位強みを取得（標準化スコアの高い順）
 */
export function getTopStrengths(profiles: ScoreProfile[], count = 5): FactorKey[] {
  return [...profiles]
    .sort((a, b) => b.standardizedScore - a.standardizedScore)
    .slice(0, count)
    .map((p) => p.factorKey);
}

/**
 * 成長領域を取得（標準化スコアの低い順）
 */
export function getGrowthAreas(profiles: ScoreProfile[], count = 3): FactorKey[] {
  return [...profiles]
    .sort((a, b) => a.standardizedScore - b.standardizedScore)
    .slice(0, count)
    .map((p) => p.factorKey);
}

/**
 * 過剰使用リスクのある因子を判定
 * 標準化スコアが85以上の因子を過剰使用リスクとみなす
 */
export function getOveruseRisks(profiles: ScoreProfile[], threshold = 85): FactorKey[] {
  return profiles
    .filter((p) => p.standardizedScore >= threshold)
    .map((p) => p.factorKey);
}

/**
 * スコアプロファイルをマップに変換（利便性のため）
 */
export function profilesToMap(profiles: ScoreProfile[]): Record<FactorKey, number> {
  const map: Record<FactorKey, number> = {} as Record<FactorKey, number>;
  for (const profile of profiles) {
    map[profile.factorKey] = profile.standardizedScore;
  }
  return map;
}
