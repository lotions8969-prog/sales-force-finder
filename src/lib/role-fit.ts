/**
 * lib/role-fit.ts
 * 役割適性スコア計算ロジック
 */

import type { FactorKey, RoleKey, RoleFitResult, ScoreProfile } from "@/types";
import { ROLE_DEFINITIONS, ROLE_KEYS } from "@/data/role-definitions";
import { profilesToMap } from "./scoring";

/**
 * 各役割の適性スコアを計算
 * 各役割のコア因子と重みを使って加重平均を算出
 */
export function computeRoleFitScores(profiles: ScoreProfile[]): RoleFitResult[] {
  const scoreMap = profilesToMap(profiles);

  const roleFitScores = ROLE_KEYS.map((roleKey) => {
    const roleDef = ROLE_DEFINITIONS[roleKey];
    const totalWeight = roleDef.coreFactors.reduce((sum, cf) => sum + cf.weight, 0);

    const weightedScore = roleDef.coreFactors.reduce((sum, cf) => {
      const factorScore = scoreMap[cf.factor] ?? 50;
      return sum + factorScore * cf.weight;
    }, 0);

    const fitScore = Math.round(weightedScore / totalWeight);

    return {
      roleKey,
      fitScore: Math.min(100, Math.max(0, fitScore)),
      rank: 0, // 後でランク付け
    };
  });

  // ランク付け（高い順）
  const sorted = [...roleFitScores].sort((a, b) => b.fitScore - a.fitScore);
  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  return sorted;
}

/**
 * 上位役割を取得
 */
export function getTopRoles(roleFitResults: RoleFitResult[], count = 3): RoleFitResult[] {
  return [...roleFitResults]
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, count);
}

/**
 * チーム内の補完関係を示唆するロジック
 * 2人のスコアプロファイルを比較し、補完し合う因子を特定
 */
export function findComplementaryFactors(
  profileA: Record<FactorKey, number>,
  profileB: Record<FactorKey, number>,
  threshold = 20 // スコア差がthreshold以上の場合に補完関係あり
): { factorKey: FactorKey; aScore: number; bScore: number; complementary: boolean }[] {
  const keys = Object.keys(profileA) as FactorKey[];
  return keys
    .map((factorKey) => ({
      factorKey,
      aScore: profileA[factorKey] ?? 50,
      bScore: profileB[factorKey] ?? 50,
      complementary: Math.abs((profileA[factorKey] ?? 50) - (profileB[factorKey] ?? 50)) >= threshold,
    }))
    .filter((item) => item.complementary);
}

/**
 * チーム全体の因子分布を計算
 */
export function computeTeamDistribution(
  allProfiles: ScoreProfile[][]
): Record<FactorKey, { avg: number; min: number; max: number; count: number }> {
  const factorData: Record<FactorKey, number[]> = {
    opportunity_creation: [],
    discovery: [],
    solution_design: [],
    influence: [],
    closing_drive: [],
    relationship_building: [],
    process_reliability: [],
    learning_agility: [],
    emotional_regulation: [],
  };

  for (const profiles of allProfiles) {
    for (const profile of profiles) {
      factorData[profile.factorKey].push(profile.standardizedScore);
    }
  }

  const result: Record<FactorKey, { avg: number; min: number; max: number; count: number }> =
    {} as Record<FactorKey, { avg: number; min: number; max: number; count: number }>;

  for (const [factorKey, scores] of Object.entries(factorData) as [FactorKey, number[]][]) {
    if (scores.length === 0) {
      result[factorKey] = { avg: 0, min: 0, max: 0, count: 0 };
    } else {
      result[factorKey] = {
        avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
      };
    }
  }

  return result;
}
