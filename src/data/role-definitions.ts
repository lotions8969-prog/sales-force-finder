import type { FactorKey, RoleKey } from "@/types";

export interface RoleDefinition {
  key: RoleKey;
  labelJa: string;
  labelEn: string;
  description: string;
  coreFactors: { factor: FactorKey; weight: number }[];
  icon: string;
  color: string;
  characteristics: string[];
  developmentHints: string[];
}

export const ROLE_DEFINITIONS: Record<RoleKey, RoleDefinition> = {
  hunter: {
    key: "hunter",
    labelJa: "ハンター型",
    labelEn: "Hunter",
    description: "新規市場・顧客の開拓を得意とし、ゼロから関係を築いてビジネスを創出する役割。",
    coreFactors: [
      { factor: "opportunity_creation", weight: 0.35 },
      { factor: "closing_drive", weight: 0.25 },
      { factor: "influence", weight: 0.20 },
      { factor: "emotional_regulation", weight: 0.10 },
      { factor: "learning_agility", weight: 0.10 },
    ],
    icon: "🎯",
    color: "#6366f1",
    characteristics: ["未開拓顧客への積極アプローチ", "高い行動量とタフさ", "スピード感のある商談推進"],
    developmentHints: ["訪問・アプローチ数のKPI設定", "断られることへのメンタル強化", "新規リストの定期的な更新"],
  },
  discovery_specialist: {
    key: "discovery_specialist",
    labelJa: "ディスカバリー型",
    labelEn: "Discovery Specialist",
    description: "顧客の潜在課題を深く掘り下げ、問題の本質を明確にする役割。コンサルティング的な営業スタイル。",
    coreFactors: [
      { factor: "discovery", weight: 0.40 },
      { factor: "relationship_building", weight: 0.25 },
      { factor: "learning_agility", weight: 0.20 },
      { factor: "solution_design", weight: 0.15 },
    ],
    icon: "🔍",
    color: "#8b5cf6",
    characteristics: ["深い傾聴力と質問力", "顧客の本音を引き出す力", "課題の構造化と言語化"],
    developmentHints: ["仮説立案→検証のサイクル訓練", "SPIN・MEDDIC等の質問フレームワーク習得", "課題整理シートの活用"],
  },
  solution_designer: {
    key: "solution_designer",
    labelJa: "提案設計型",
    labelEn: "Solution Designer",
    description: "複雑な顧客課題を解決する最適な提案を設計し、差別化された価値を伝える役割。",
    coreFactors: [
      { factor: "solution_design", weight: 0.35 },
      { factor: "discovery", weight: 0.25 },
      { factor: "process_reliability", weight: 0.20 },
      { factor: "learning_agility", weight: 0.20 },
    ],
    icon: "📐",
    color: "#a855f7",
    characteristics: ["顧客カスタマイズ提案", "論理的な提案構成力", "競合差別化の言語化"],
    developmentHints: ["提案書レビューのOJT強化", "顧客事例のインプット習慣", "プレゼンテーション力の向上"],
  },
  closer: {
    key: "closer",
    labelJa: "クロージング型",
    labelEn: "Closer",
    description: "商談の終盤を得意とし、意思決定を引き出し成約へと導く役割。交渉と推進力が武器。",
    coreFactors: [
      { factor: "closing_drive", weight: 0.35 },
      { factor: "influence", weight: 0.30 },
      { factor: "emotional_regulation", weight: 0.20 },
      { factor: "opportunity_creation", weight: 0.15 },
    ],
    icon: "🏁",
    color: "#ec4899",
    characteristics: ["クロージングのタイミング察知", "価格・条件交渉力", "停滞案件の再起動"],
    developmentHints: ["クロージングトーク集の整備", "価格交渉シミュレーション訓練", "意思決定支援の質問技術習得"],
  },
  account_developer: {
    key: "account_developer",
    labelJa: "アカウント育成型",
    labelEn: "Account Developer",
    description: "既存顧客の深耕・横展開を担い、継続収益と顧客LTVを最大化する役割。",
    coreFactors: [
      { factor: "relationship_building", weight: 0.30 },
      { factor: "discovery", weight: 0.25 },
      { factor: "solution_design", weight: 0.25 },
      { factor: "process_reliability", weight: 0.20 },
    ],
    icon: "🌱",
    color: "#22c55e",
    characteristics: ["顧客の事業成長への貢献意識", "クロスセル・アップセル提案", "長期パートナーシップ構築"],
    developmentHints: ["定期的なビジネスレビュー（QBR）の実施", "顧客成功事例の共有", "追加提案のタイミング察知訓練"],
  },
  relationship_builder: {
    key: "relationship_builder",
    labelJa: "関係構築型",
    labelEn: "Relationship Builder",
    description: "深い信頼関係を武器に、顧客のロイヤルティを高める役割。誠実さと継続的な関与が特徴。",
    coreFactors: [
      { factor: "relationship_building", weight: 0.40 },
      { factor: "emotional_regulation", weight: 0.25 },
      { factor: "discovery", weight: 0.20 },
      { factor: "process_reliability", weight: 0.15 },
    ],
    icon: "🤝",
    color: "#14b8a6",
    characteristics: ["顧客の個人的関心への気配り", "約束を必ず守る誠実さ", "長期的視点でのフォロー"],
    developmentHints: ["関係構築ログの習慣化", "顧客への定期的な価値提供", "感謝・配慮の表現方法のレパートリー強化"],
  },
  process_operator: {
    key: "process_operator",
    labelJa: "再現性運用型",
    labelEn: "Process Operator",
    description: "標準化されたプロセスを確実に実行し、チーム全体の生産性と再現性を高める役割。",
    coreFactors: [
      { factor: "process_reliability", weight: 0.40 },
      { factor: "emotional_regulation", weight: 0.20 },
      { factor: "solution_design", weight: 0.20 },
      { factor: "learning_agility", weight: 0.20 },
    ],
    icon: "⚙️",
    color: "#0ea5e9",
    characteristics: ["抜け漏れのないフォロー管理", "CRM・ツール活用の徹底", "予測可能な行動パターン"],
    developmentHints: ["SOP（標準手順書）の作成・活用", "月次レビューでの改善サイクル", "チームへの横展開・ノウハウ共有"],
  },
  next_leader: {
    key: "next_leader",
    labelJa: "次世代リーダー候補型",
    labelEn: "Next Leader",
    description: "高い学習力と感情知性を持ち、チームへの影響力と全体最適の視点を発揮できる役割。",
    coreFactors: [
      { factor: "learning_agility", weight: 0.25 },
      { factor: "emotional_regulation", weight: 0.20 },
      { factor: "discovery", weight: 0.20 },
      { factor: "influence", weight: 0.20 },
      { factor: "solution_design", weight: 0.15 },
    ],
    icon: "⭐",
    color: "#f59e0b",
    characteristics: ["チームへの影響力と巻き込み力", "失敗から素早く学ぶ姿勢", "全体最適を考えた行動"],
    developmentHints: ["後輩育成・メンタリングの機会提供", "リーダーシップ研修への参加", "戦略的な視点のインプット（MBA等）"],
  },
};

export const ROLE_KEYS = Object.keys(ROLE_DEFINITIONS) as RoleKey[];
