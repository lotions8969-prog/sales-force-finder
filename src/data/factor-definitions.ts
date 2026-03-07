import type { FactorKey } from "@/types";

export interface FactorDefinition {
  key: FactorKey;
  labelJa: string;
  labelEn: string;
  description: string;
  highDescription: string;   // スコアが高い場合の説明
  overuseRisk: string;       // 過剰使用リスク
  color: string;             // チャート用カラー
}

export const FACTOR_DEFINITIONS: Record<FactorKey, FactorDefinition> = {
  opportunity_creation: {
    key: "opportunity_creation",
    labelJa: "新規接点創出力",
    labelEn: "Opportunity Creation",
    description: "新しい顧客や機会を自ら開拓する能力。アウトリーチ、ネットワーキング、新規アプローチへの積極性。",
    highDescription: "未開拓の市場や顧客への積極的なアプローチを得意とし、ビジネスチャンスを自ら作り出せる。",
    overuseRisk: "新規顧客への執着が強すぎると、既存顧客のフォローが疎かになる場合がある。",
    color: "#6366f1",
  },
  discovery: {
    key: "discovery",
    labelJa: "課題探索力",
    labelEn: "Discovery",
    description: "顧客の潜在的な課題や本音を深掘りする傾聴・質問力。課題の本質を見抜く洞察力。",
    highDescription: "顧客が言語化できていない課題を引き出すことを得意とし、信頼感のあるヒアリングができる。",
    overuseRisk: "ヒアリングに時間をかけすぎて、提案や意思決定の推進が遅れるリスクがある。",
    color: "#8b5cf6",
  },
  solution_design: {
    key: "solution_design",
    labelJa: "提案構築力",
    labelEn: "Solution Design",
    description: "顧客課題に合わせた最適な提案を設計・カスタマイズする能力。論理的な構成力と課題解決思考。",
    highDescription: "複雑な課題を整理し、顧客視点で最適な解決策を設計する力を持つ。",
    overuseRisk: "提案の完璧さにこだわりすぎて、スピードが落ちたり、シンプルな提案が必要な場面で過剰になることがある。",
    color: "#a855f7",
  },
  influence: {
    key: "influence",
    labelJa: "影響・交渉力",
    labelEn: "Influence",
    description: "相手を説得し意思決定を引き出す力。反論への対応、関係者の巻き込み、価値交渉の能力。",
    highDescription: "論理と感情の両面から相手にアプローチし、意思決定を促すことが得意。",
    overuseRisk: "押しが強すぎると顧客に圧力をかけていると感じさせ、関係を損なうリスクがある。",
    color: "#ec4899",
  },
  closing_drive: {
    key: "closing_drive",
    labelJa: "前進推進力",
    labelEn: "Closing Drive",
    description: "商談を前進・クロージングへ推進する行動力。次ステップの提示、停滞案件の再活性化。",
    highDescription: "商談の停滞を嫌い、具体的な次のステップを自ら提示して案件を動かす力を持つ。",
    overuseRisk: "クロージングを急ぎすぎると顧客が納得しないまま進んでしまい、後でキャンセルや不満につながることがある。",
    color: "#f97316",
  },
  relationship_building: {
    key: "relationship_building",
    labelJa: "関係構築力",
    labelEn: "Relationship Building",
    description: "顧客との長期的な信頼関係を築き維持する能力。誠実さ、継続的な関与、個人的な関心。",
    highDescription: "顧客から「あなたに頼みたい」と言われるような、深い信頼関係を築ける。",
    overuseRisk: "関係性を重視しすぎて、必要な交渉や断りが言えなくなるリスクがある。",
    color: "#22c55e",
  },
  process_reliability: {
    key: "process_reliability",
    labelJa: "プロセス遂行力",
    labelEn: "Process Reliability",
    description: "営業プロセスを確実に実行し、記録・管理・フォローアップを怠らない能力。再現性と信頼性。",
    highDescription: "何事も抜け漏れなく実行し、複数案件を同時に管理しながら着実に前進できる。",
    overuseRisk: "プロセス遵守を優先しすぎると、状況変化への柔軟な対応が遅れることがある。",
    color: "#14b8a6",
  },
  learning_agility: {
    key: "learning_agility",
    labelJa: "学習俊敏性",
    labelEn: "Learning Agility",
    description: "失敗から学び、フィードバックを吸収し、新しい知識やスキルを素早く取り込む能力。",
    highDescription: "失注からも学びを得て、行動を継続的に改善し、変化に素早く対応できる。",
    overuseRisk: "常に新しいやり方を試し続けると、一貫したスタイルが確立されずチームへの影響が読みにくくなる場合がある。",
    color: "#0ea5e9",
  },
  emotional_regulation: {
    key: "emotional_regulation",
    labelJa: "感情安定性",
    labelEn: "Emotional Regulation",
    description: "プレッシャーや失敗、困難な顧客対応においても感情を安定させパフォーマンスを維持する能力。",
    highDescription: "どんな局面でも冷静さを保ち、感情に左右されない安定したパフォーマンスを発揮できる。",
    overuseRisk: "感情を抑えすぎると、熱意や緊迫感が伝わりにくくなり、顧客への影響力が薄れることがある。",
    color: "#f59e0b",
  },
};

export const FACTOR_KEYS = Object.keys(FACTOR_DEFINITIONS) as FactorKey[];
