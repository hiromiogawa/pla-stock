# ADR-0010: マスターデータ (Kit / Paint) 投入手段の方針

## ステータス
Accepted

## コンテキスト

pla-stock の Kit / Paint master は **admin curated only**（一般ユーザーは編集不可、Phase A-2 mock 仕様）。

- 起票時 (#62) の状況: master は `src/entities/{kit,paint}/api/mock/*.ts` の TypeScript 配列に直書き
- Phase C で D1 + Drizzle へ移行（ADR-0006）後、master データを実 DB に投入・更新する手段が必要
- #62 では選択肢 a〜e を整理し「個人開発規模では seed file + CLI 併用が現実的、Web UI は overkill」と検討していた
- Phase C 着手中に **seed infra は既に構築済**: `src/shared/lib/db/seed.ts`（seed ロジック）/ `scripts/seed-local.mjs` / `pnpm db:seed:local` / `drizzle/migrations/`

本 ADR は #62 の検討結論を確定し、SSoT として記録する（#62 はこれをもって close）。

## 決定

マスターデータ投入は **b（SQL/Drizzle seed file 運用）+ d（wrangler CLI / npm script）の併用**を正式手段とする。

- **開発中の master 改訂**: `src/entities/{kit,paint}/api/mock/*.ts` を編集（現状の mock を SSoT 的に維持）し、`src/shared/lib/db/seed.ts` がそれを D1 に流し込む
- **local 反映**: `pnpm db:migrate:local` → `pnpm db:seed:local`（`scripts/seed-local.mjs`）
- **prod 反映**: migration apply（`pnpm db:migrate:remote`）+ seed は wrangler 経由の CLI script で投入（admin 手動オペレーション）
- **Web 管理 UI（選択肢 e）は Phase F 以降に再評価**。MVP / Phase C〜E では採用しない

## 選択肢

| 選択肢 | メリット | デメリット | 判断 |
|--------|---------|----------|------|
| a. mock ts 直編集 | コスト0・即時（rebuild） | admin 専用、実 DB と乖離 | 開発中の編集起点として併用 |
| b. SQL/Drizzle seed file | 低コスト・型安全・再現性 | migrate/seed 実行が必要 | **採用**（実 DB 投入の正路）|
| c. D1 console 直叩き | CF dashboard で即時 | 生 SQL・ヒューマンエラー | 緊急時のみ・標準にしない |
| d. wrangler CLI + script | コマンド一発・CI 化可 | CLI 慣れが前提 | **採用**（prod 投入手段）|
| e. 簡易 admin Web UI | 即時・非エンジニア可 | 実装コスト高・MVP に overkill | Phase F 以降に再評価 |

## 結果

- #62 を close（本 ADR が検討結論の SSoT）
- 既存 seed infra（`seed.ts` / `db:seed:local` / `scripts/seed-local.mjs`）が canonical path として確定。新規 master 追加時はこの経路に従う
- Phase E (#7) / Phase F (#8) で admin Web UI の必要性が再浮上した場合は、本 ADR を Supersede する新 ADR を起票し #7 / #8 に紐付ける
- 関連: ADR-0006（Drizzle + D1）、#5（Phase C Epic）の mock→実 DB 置換タスク
