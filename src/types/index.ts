// 診断ファクター定義
export type FactorKey =
  | "opportunity_creation"
  | "discovery"
  | "solution_design"
  | "influence"
  | "closing_drive"
  | "relationship_building"
  | "process_reliability"
  | "learning_agility"
  | "emotional_regulation";

// 役割カテゴリ
export type RoleKey =
  | "hunter"
  | "discovery_specialist"
  | "solution_designer"
  | "closer"
  | "account_developer"
  | "relationship_builder"
  | "process_operator"
  | "next_leader";

// 設問タイプ
export type QuestionType = "likert" | "forced_choice" | "sjt";

// Likert設問
export interface LikertQuestion {
  id: string;
  type: "likert";
  text: string;
  factor: FactorKey;
  reversed: boolean; // 逆転項目
  weight: number;    // 重み (通常1.0)
}

// Forced-choice設問
export interface ForcedChoiceQuestion {
  id: string;
  type: "forced_choice";
  optionA: { text: string; factor: FactorKey; weight: number };
  optionB: { text: string; factor: FactorKey; weight: number };
}

// SJT設問
export interface SJTOption {
  key: string;   // "A" | "B" | "C" | "D"
  text: string;
  scores: Partial<Record<FactorKey, number>>;
}

export interface SJTQuestion {
  id: string;
  type: "sjt";
  scenario: string;
  options: SJTOption[];
}

// レスポンス
export interface ItemResponse {
  questionId: string;
  questionType: QuestionType;
  responseValue: string | number; // Likert:1-5, FC:"A"|"B", SJT:"A"|"B"|"C"|"D"
}

// スコアプロファイル
export interface ScoreProfile {
  factorKey: FactorKey;
  rawScore: number;
  standardizedScore: number; // 0-100
}

// 役割適性
export interface RoleFitResult {
  roleKey: RoleKey;
  fitScore: number; // 0-100
  rank: number;
}

// 診断レポート
export interface AssessmentReport {
  sessionId: string;
  userId: string;
  userName: string;
  completedAt: string;
  scores: ScoreProfile[];
  topStrengths: FactorKey[];       // Top5強み
  growthAreas: FactorKey[];        // 伸ばすべき領域 Top3
  overuseRisks: FactorKey[];       // 過剰使用リスク
  roleFit: RoleFitResult[];
  recommendations: {
    salesStyle: string;           // 推奨営業スタイル
    managerTips: string;          // 上司が知っておくべき関わり方
    weeklyActions: string[];      // 今週から実践すべき3つのアクション
    developmentPlan: string;      // 育成施策
    teamComplement: string;       // チーム内補完関係
    overuseWarning: string;       // 強みの過剰使用リスク説明
  };
}

// セッション進行状態
export interface AssessmentState {
  sessionId: string;
  currentSection: "likert" | "forced_choice" | "sjt" | "completed";
  currentIndex: number;
  responses: ItemResponse[];
  totalQuestions: number;
}
