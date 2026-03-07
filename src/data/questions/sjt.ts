import type { SJTQuestion } from "@/types";

// SJT（状況判断テスト）設問 8問
// 各選択肢は営業場面での行動傾向を反映し、因子ごとのスコアを持つ
// 回答はA〜Dから1つ選択

export const SJT_QUESTIONS: SJTQuestion[] = [
  {
    id: "SJT01",
    type: "sjt",
    scenario:
      "重要な見込み顧客へのアプローチを開始したが、電話・メールでの最初の3回の連絡にまったく返答がなかった。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "しばらく期間を置いてから、別のチャネル（メール→電話→SNSなど）に変えて再度アプローチする。",
        scores: { opportunity_creation: 2, learning_agility: 2, process_reliability: 1 },
      },
      {
        key: "B",
        text: "すぐに上司に報告し、別の担当者や別ルートからアプローチしてもらうよう調整する。",
        scores: { process_reliability: 2, emotional_regulation: 1 },
      },
      {
        key: "C",
        text: "対象顧客の最新ニュースや業界課題を調査し、具体的な価値提案を添えた新しいメッセージを送る。",
        scores: { opportunity_creation: 4, discovery: 2, solution_design: 2, learning_agility: 1 },
      },
      {
        key: "D",
        text: "一時的に保留し、反応がある他の見込み顧客へのアプローチを優先する。",
        scores: { process_reliability: 1, closing_drive: 1 },
      },
    ],
  },
  {
    id: "SJT02",
    type: "sjt",
    scenario:
      "顧客との初回商談で、顧客は「今は特に困っていない」と言っている。しかし、あなたはその顧客の業界に課題が潜んでいると感じている。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "「そうですか、またご縁があれば」と礼儀よく会話を終了する。",
        scores: { emotional_regulation: 1, relationship_building: 1 },
      },
      {
        key: "B",
        text: "顧客の業界で起きている変化について質問し、将来的なリスクや機会を一緒に考える。",
        scores: { discovery: 3, learning_agility: 2, relationship_building: 2 },
      },
      {
        key: "C",
        text: "すぐに自社サービスの事例紹介に切り替えて、潜在的な価値を伝える。",
        scores: { solution_design: 2, influence: 1, closing_drive: 1 },
      },
      {
        key: "D",
        text: "「具体的にどのような状態が理想ですか？」と将来のビジョンを深掘りする質問をする。",
        scores: { discovery: 4, relationship_building: 2, solution_design: 1 },
      },
    ],
  },
  {
    id: "SJT03",
    type: "sjt",
    scenario:
      "提案を行ったが、顧客から「他社より価格が高い」という反応が返ってきた。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "競合他社と比較したときの価値の違いと差別化ポイントを丁寧に説明する。",
        scores: { influence: 3, solution_design: 2, learning_agility: 1 },
      },
      {
        key: "B",
        text: "値引きできるかどうかをすぐに上司に確認し、できる限りの条件を提示する。",
        scores: { process_reliability: 1, closing_drive: 1 },
      },
      {
        key: "C",
        text: "顧客が「高い」と感じる基準は何かを質問し、本当の懸念を特定する。",
        scores: { discovery: 4, influence: 2 },
      },
      {
        key: "D",
        text: "導入後のROIや期待される効果を数字で示し、価格対効果の説得力を高める。",
        scores: { solution_design: 4, influence: 2, closing_drive: 1 },
      },
    ],
  },
  {
    id: "SJT04",
    type: "sjt",
    scenario:
      "商談が2ヶ月以上停滞している。顧客は「社内で検討中」と言うが、次のアクションが見えない状態が続いている。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "顧客のペースを尊重し、無理に急かさず連絡を控えて待つ。",
        scores: { relationship_building: 1, emotional_regulation: 1 },
      },
      {
        key: "B",
        text: "「いつ頃ご判断いただけそうですか？」と期限の確認を行い、商談を前進させる。",
        scores: { closing_drive: 3, influence: 1 },
      },
      {
        key: "C",
        text: "「現在の社内検討で何かお力になれることはありますか？」と状況を把握し、前進を支援する。",
        scores: { discovery: 3, relationship_building: 3, closing_drive: 2 },
      },
      {
        key: "D",
        text: "市場動向・競合動向・新しい事例など追加情報を提供し、検討を再活性化させるきっかけを作る。",
        scores: { learning_agility: 2, closing_drive: 3, opportunity_creation: 1 },
      },
    ],
  },
  {
    id: "SJT05",
    type: "sjt",
    scenario:
      "今月末のノルマ達成まであと一歩のところで、重要案件のクロージングを進めたい。しかし顧客はまだ「もう少し考えたい」と言っている。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "「月末までにご決断いただけると非常に助かります」と正直に状況を伝え、判断を促す。",
        scores: { closing_drive: 3, emotional_regulation: 2, influence: 1 },
      },
      {
        key: "B",
        text: "顧客がまだ迷っている理由を再度確認し、その懸念を解消することだけに集中する。",
        scores: { discovery: 4, relationship_building: 2, solution_design: 1 },
      },
      {
        key: "C",
        text: "特別な条件（早期割引・追加サポートなど）を提示して、意思決定を後押しする。",
        scores: { closing_drive: 4, influence: 2 },
      },
      {
        key: "D",
        text: "「いつでも準備できています。ゆっくりご検討ください」と伝え、顧客のタイミングに合わせる。",
        scores: { relationship_building: 3, emotional_regulation: 2 },
      },
    ],
  },
  {
    id: "SJT06",
    type: "sjt",
    scenario:
      "担当している既存顧客から、競合他社の提案を受けているという話を聞いた。顧客はあなたの提案と迷っているようだ。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "「競合の提案のどのような点が魅力的でしたか？」と率直に聞き、比較のポイントを把握する。",
        scores: { discovery: 4, influence: 2, learning_agility: 1 },
      },
      {
        key: "B",
        text: "自社の強みと差別化ポイントを改めて整理し、顧客に改めて伝える。",
        scores: { solution_design: 3, influence: 2 },
      },
      {
        key: "C",
        text: "競合の話には触れず、あくまで自社の価値をさらに高めることに集中する。",
        scores: { solution_design: 2, emotional_regulation: 2 },
      },
      {
        key: "D",
        text: "顧客が本当に求めていることを改めて確認し、最もマッチするよう提案内容を修正する。",
        scores: { discovery: 3, solution_design: 4, relationship_building: 1 },
      },
    ],
  },
  {
    id: "SJT07",
    type: "sjt",
    scenario:
      "チームの後輩が大事な商談でうまくいかず、ひどく落ち込んでいる様子だ。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "「気にしすぎないで。次がある」と励まし、早く次の活動に向かうよう明るく促す。",
        scores: { emotional_regulation: 1, closing_drive: 1 },
      },
      {
        key: "B",
        text: "一緒に商談を振り返り、何が良くて何が課題だったかを具体的に話し合う。",
        scores: { learning_agility: 4, process_reliability: 2, discovery: 1 },
      },
      {
        key: "C",
        text: "自分自身の失敗経験を共有しながら、立ち直り方のヒントを伝える。",
        scores: { relationship_building: 4, emotional_regulation: 3, learning_agility: 1 },
      },
      {
        key: "D",
        text: "上司に状況を報告し、適切な指導やフォローを依頼する。",
        scores: { process_reliability: 2, emotional_regulation: 1 },
      },
    ],
  },
  {
    id: "SJT08",
    type: "sjt",
    scenario:
      "長年付き合いのある大切な顧客から突然「今後は別の会社に発注することにした」という連絡があった。あなたはどうしますか？",
    options: [
      {
        key: "A",
        text: "「残念ですが、これまでのご縁に感謝します」と礼儀正しく返答する。",
        scores: { emotional_regulation: 2, relationship_building: 1 },
      },
      {
        key: "B",
        text: "「何が理由でそのようなご判断をされましたか？」と原因を直接確認する。",
        scores: { discovery: 4, learning_agility: 3 },
      },
      {
        key: "C",
        text: "すぐに訪問・連絡し、関係の修復と再提案の機会をお願いする。",
        scores: { relationship_building: 4, closing_drive: 2, opportunity_creation: 1 },
      },
      {
        key: "D",
        text: "今後の関係継続の可能性を確認しながら、今回の判断の背景を丁寧に把握する。",
        scores: { discovery: 3, relationship_building: 4, learning_agility: 2 },
      },
    ],
  },
];
