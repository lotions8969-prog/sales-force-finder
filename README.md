# 営業強み診断ツール — Sales Force Finder

営業チームメンバーの強み・弱みを可視化し、役割適性と育成施策を提案するWebアプリ。

## デモ

**公開URL**: https://sales-force-finder-ombdz436f-motohashis-projects.vercel.app

| アカウント | メール | パスワード |
|-----------|--------|-----------|
| 管理者 | admin@example.com | admin123 |
| メンバー | tanaka@example.com | member123 |

## 機能

- **診断（65問）**: Likert形式(45問) + 比較選択(12問) + 営業シナリオ(8問)
- **9因子スコア**: 新規接点創出力・課題探索力・提案構築力など
- **8役割適性**: ハンター型・ディスカバリー型・クロージング型など
- **個人レポート**: レーダーチャート・上位強み・育成アクション・上司向けヒント
- **チーム分析**: 全体スコア分布・役割バランス・メンバー比較表
- **CSVエクスポート**: 管理者が全メンバーのスコアを一括ダウンロード

## ローカル起動

```bash
# 依存関係インストール
npm install

# DBセットアップ
npx prisma db push

# デモデータ投入
npx ts-node -r tsconfig-paths/register --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 開発サーバー起動
npm run dev
```

→ http://localhost:3000 でアクセス

## 技術スタック

| 用途 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| DB | Prisma + SQLite (ローカル) |
| 認証 | NextAuth.js v5 |
| チャート | Recharts |

## 診断ロジック

`src/lib/scoring.ts` — 純粋関数によるスコアリング（決定論的・再現可能）

```
Likert(5件法) + Forced-choice(比較選択) + SJT(状況判断)
       ↓
  因子別Raw Score
       ↓
  標準化スコア(0-100)
       ↓
  役割適性スコア(加重平均)
       ↓
  レポート生成
```

## 将来拡張

- Claude APIを使ったレポート文章生成（`lib/report-generator.ts`を拡張）
- DBをSQLite→PostgreSQL(Neon/Supabase)へ切り替え（`schema.prisma`のprovider変更のみ）
