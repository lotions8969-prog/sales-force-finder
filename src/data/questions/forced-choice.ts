import type { ForcedChoiceQuestion } from "@/types";

// Forced-choice設問 12ブロック
// 選択肢A/Bそれぞれに因子と重みを設定
// 選んだ方の因子にポイント加算

export const FORCED_CHOICE_QUESTIONS: ForcedChoiceQuestion[] = [
  {
    id: "FC01",
    type: "forced_choice",
    optionA: {
      text: "新しい顧客を次々と開拓することに力を注ぐ方だ。",
      factor: "opportunity_creation",
      weight: 3,
    },
    optionB: {
      text: "既存顧客との絆を深め、長期的な信頼関係を大切にする方だ。",
      factor: "relationship_building",
      weight: 3,
    },
  },
  {
    id: "FC02",
    type: "forced_choice",
    optionA: {
      text: "顧客の本音や隠れた課題を、時間をかけて丁寧に引き出すことを最優先にする。",
      factor: "discovery",
      weight: 3,
    },
    optionB: {
      text: "商談を前進させ、具体的な決断を引き出すことを最優先にする。",
      factor: "closing_drive",
      weight: 3,
    },
  },
  {
    id: "FC03",
    type: "forced_choice",
    optionA: {
      text: "顧客課題に合わせた緻密な提案を設計することが自分の強みだ。",
      factor: "solution_design",
      weight: 3,
    },
    optionB: {
      text: "相手を動かし、意思決定を促すことが自分の強みだ。",
      factor: "influence",
      weight: 3,
    },
  },
  {
    id: "FC04",
    type: "forced_choice",
    optionA: {
      text: "決めたプロセスを着実に実行し、再現性の高い仕事をすることが得意だ。",
      factor: "process_reliability",
      weight: 3,
    },
    optionB: {
      text: "失敗から素早く学び、やり方を柔軟に変えながら成長することが得意だ。",
      factor: "learning_agility",
      weight: 3,
    },
  },
  {
    id: "FC05",
    type: "forced_choice",
    optionA: {
      text: "どんな状況でも感情を安定させ、冷静に行動することを大切にしている。",
      factor: "emotional_regulation",
      weight: 3,
    },
    optionB: {
      text: "チャンスを逃さず、積極的に前進する決断力があると思う。",
      factor: "closing_drive",
      weight: 3,
    },
  },
  {
    id: "FC06",
    type: "forced_choice",
    optionA: {
      text: "新しい出会いやビジネスチャンスを自ら作り出すのが得意だ。",
      factor: "opportunity_creation",
      weight: 3,
    },
    optionB: {
      text: "顧客のニーズを深く理解した上で、最適な解決策を組み立てるのが得意だ。",
      factor: "solution_design",
      weight: 3,
    },
  },
  {
    id: "FC07",
    type: "forced_choice",
    optionA: {
      text: "顧客の課題を徹底的に深掘りし、本質的な問題を特定するのが得意だ。",
      factor: "discovery",
      weight: 3,
    },
    optionB: {
      text: "顧客と強い信頼関係を築き、長く付き合い続けるのが得意だ。",
      factor: "relationship_building",
      weight: 3,
    },
  },
  {
    id: "FC08",
    type: "forced_choice",
    optionA: {
      text: "相手の心を動かし、意思決定を導くことが得意だ。",
      factor: "influence",
      weight: 3,
    },
    optionB: {
      text: "抜け漏れなくプロセスを管理し、確実に成果につなげることが得意だ。",
      factor: "process_reliability",
      weight: 3,
    },
  },
  {
    id: "FC09",
    type: "forced_choice",
    optionA: {
      text: "状況に応じて学びながらアプローチを変えていくのが得意だ。",
      factor: "learning_agility",
      weight: 3,
    },
    optionB: {
      text: "新しい場所・人・機会に積極的に飛び込んでいくのが得意だ。",
      factor: "opportunity_creation",
      weight: 3,
    },
  },
  {
    id: "FC10",
    type: "forced_choice",
    optionA: {
      text: "商談をクローズに向けて力強く推進するのが得意だ。",
      factor: "closing_drive",
      weight: 3,
    },
    optionB: {
      text: "顧客とゆっくり関係を育て、深い信頼を積み上げるのが得意だ。",
      factor: "relationship_building",
      weight: 3,
    },
  },
  {
    id: "FC11",
    type: "forced_choice",
    optionA: {
      text: "どんな状況でも自分の感情をコントロールし、安定したパフォーマンスを発揮できる。",
      factor: "emotional_regulation",
      weight: 3,
    },
    optionB: {
      text: "顧客の言葉の奥にある本音や課題を、じっくりと引き出すのが得意だ。",
      factor: "discovery",
      weight: 3,
    },
  },
  {
    id: "FC12",
    type: "forced_choice",
    optionA: {
      text: "複雑な顧客課題を整理し、最適な提案を設計することが得意だ。",
      factor: "solution_design",
      weight: 3,
    },
    optionB: {
      text: "新しい知識やフィードバックを素早く吸収して成長するのが得意だ。",
      factor: "learning_agility",
      weight: 3,
    },
  },
];
