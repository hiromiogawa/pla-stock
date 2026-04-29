# pla-stock

プラモデル・塗料の在庫管理ツール。

**MVP スコープ**: プラモデル（キット）管理 + 塗料管理の 2 ドメイン。消耗品（ヤスリ・マスキング・軟化剤など）は v2 以降。

**ステータス**: Phase 1 — AI ハーネスのみ導入済み。フレームワーク / ツール類は未スキャフォールド。

---

## 🛑 必ず最初に読むこと: Skill 起動ルール

このプロジェクトは `.claude/skills/` 配下のスキルを **状況トリガー** で必ず起動する運用。
「呼べる」ではなく「呼ばねばならない」。**Skill ツールで明示起動**することで手順省略を防ぐ。

### トリガー表（このトリガーに該当したら即 Skill 起動）

| トリガー | 起動する Skill | 備考 |
|---|---|---|
| **セッション開始時** | `memory-usage` | 過去の決定・好み・失敗事例を memory_search |
| **Issue 着手前** | `dev-start` | memory 検索 → ブランチ作成 → 仕様確認をオーケストレート |
| **新機能・新コンポーネントの設計開始時** | `superpowers:brainstorming` | ユーザー意図・要件・設計を発散→収束 |
| **複数ステップの実装計画を立てる時** | `superpowers:writing-plans` | spec を実装計画に落とす |
| **設計判断（ライブラリ選定・アーキ変更）した時** | `design-decision` | ADR 作成 → memory_save |
| **実装完了→コミット直前** | `dev-complete` → `self-review` → `conventional-commits` | 検証サイクル必須・省略不可 |
| **PR 作成時** | `github-flow` | Issue 紐付け（`Closes #XX`）必須 |
| **コードレビュー指摘を受けた時** | `post-review` | failure-record → rule-cycle |
| **エージェントが同じミスを繰り返した時** | `failure-record` | ADR-0007 形式で記録 |
| **「ルールを改善して」依頼時** | `rule-cycle` | measure → explore → improve → audit |
| **ドキュメント追加・更新時** | `docs-freshness` | Why/What/How 分類、自動生成先か手動か判定 |
| **Issue 起票時** | `writing-issues` | Type 別本文構成・親子紐付け・アンチパターン |
| **新スキル作成・編集時** | `writing-project-skills` | プロジェクト skill 規約 |

### 一覧（参照用）

`.claude/skills/` 配下の全スキル:

- **memory-usage** — claude-memory MCP で記憶を保存・検索
- **dev-start** — Issue 着手オーケストレーター
- **dev-complete** — 実装完了オーケストレーター（self-review → docs-freshness → conventional-commits → PR）
- **post-review** — レビュー後オーケストレーター（failure-record → rule-cycle）
- **design-decision** — 設計判断オーケストレーター（adr → memory_save）
- **self-review** — lint/test/dep-check/knip/build + コード re-read
- **conventional-commits** — type(scope): description 規約（scope は `.project-config.yml`）
- **github-flow** — Epic/Task/Story/Bug 階層、PR と Issue は 1:1
- **sdd** — Markdown 仕様 → JSDoc に SSoT 移行
- **adr** — `docs/adr/` の設計判断記録（不変・Supersede のみ）
- **code-quality** — OXLint/Biome/knip/dep-cruiser の運用基準
- **docs-freshness** — Why/What/How 分類、自動生成 vs 手動の判断
- **failure-record** — エージェント失敗の記録と再発防止
- **rule-measure / rule-explore / rule-improve / rule-audit / rule-cycle** — ルール改善サイクル
- **project-bootstrap** — 新プロジェクト初期化オーケストレーター
- **writing-issues** — Issue 本文構成・タイトル命名・親子紐付け・アンチパターンの規約
- **writing-project-skills** — プロジェクト skill 規約

> **注**: 移植元の st-cost は Next.js / pnpm 前提で書かれている skill が多い。pla-stock は TanStack Start + Cloudflare + Neon + Drizzle を採用予定のため、Phase 2（スキャフォールド時）に `code-quality`, `self-review`, `conventional-commits` などを本プロジェクトのスタックに合わせて更新すること。

---

## アーキテクチャ

**未確定**（Phase 2 でスキャフォールド時に確定）。FSD 類似のレイヤー構造を採用予定。確定後に `design-decision` Skill で ADR 記録し、本セクションと `.project-config.yml` の `architecture.layers` を更新する。

## 技術スタック

**Phase 1: 未確定**。

予定:

| レイヤー | 技術 |
|---|---|
| フレームワーク | TanStack Start |
| 言語 | TypeScript |
| ホスティング | Cloudflare Workers |
| DB | Neon (Postgres) |
| ORM | Drizzle（仮） |

Phase 2 で正式採用。採用時に `design-decision` Skill で ADR-001 を記録する。

## プロジェクト固有の指示

- **main への直接コミット禁止**。編集前に `git branch --show-current` を確認、`main` なら **`dev-start` Skill を起動** して feature ブランチへ
- **コミット前は必ず `dev-complete` Skill を起動**（self-review → docs-freshness → commit）。手で `git commit` するだけは NG
- コミットメッセージは Conventional Commits（scope は `.project-config.yml` の enum を参照）
- **narrative は日本語で記述する**：コミット本文 / PR タイトル&本文 / Issue タイトル&本文 / ドキュメント。`type(scope):` プレフィックスとコード内識別子（変数名・関数名）は英語のまま、技術用語の英語混在も OK。
- PR は必ず関連 Issue を `Closes #XX` で紐付ける
- 型定義変更時は JSDoc も同時に更新する（SDD ルール: 実装後は型 + JSDoc が SSoT）
- テストは在庫更新などの純粋関数を中心に書く
- 設計判断があったら **`design-decision` Skill を起動**（ADR 追加 + memory_save）
- セルフレビュー・コードレビューの結果は PR 上にコメントとして残す（`gh pr comment`）。指摘 → 修正 → 修正内容を返信コメントで記録

## ローカル専用ファイル

- `docs/superpowers/` — AI 向けの一過性の設計メモ・実装計画（`.gitignore` で除外、公開リポジトリに含めない）

## ドキュメント

Phase 2 で以下を整備予定：

- `docs/adr/` — 設計判断記録
- `docs/specs/` — 追加仕様
- `docs/api/` — typedoc 自動生成（gitignore）
- `docs/generated/` — 依存関係図 等（gitignore）

## コマンド

| コマンド | 用途 |
|---|---|
| `pnpm dev` | 開発サーバ起動（Vite, http://localhost:3000 ） |
| `pnpm build` | プロダクションビルド (`vite build && tsc --noEmit`) |
| `pnpm preview` | ビルド済みアセットのローカルプレビュー |
| `pnpm deploy` | Cloudflare Workers にデプロイ (`wrangler deploy`) |
| `pnpm cf-typegen` | Cloudflare バインディングの型生成 (`wrangler types`) |
| `pnpm install` | 依存インストール（postinstall で cf-typegen 自動実行） |
| `pnpm lint` | oxlint で静的解析 |
| `pnpm lint:fix` | oxlint の自動修正 |
| `pnpm format` | biome で format チェック (no-write) |
| `pnpm format:write` | biome で全ファイル整形 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm depcruise` | dependency-cruiser で FSD レイヤー違反/循環依存を検出 |
| `pnpm knip` | knip strict で未使用 export/file を検出 |
| `pnpm check:parallel` | typecheck + depcruise + knip を並列実行 (pre-commit 用) |
| `pnpm check` | lint → format → typecheck → depcruise → knip を直列実行 (CI 用) |

Node バージョンマネージャ使用時は `nvm use` / `fnm use` / `volta pin` で `.nvmrc` に追従。

## Git Hooks

**husky v9 + lint-staged + commitlint で導入済**（ADR-0001 参照）。

| Hook | 内容 |
|---|---|
| `pre-commit` | `lint-staged` (oxlint --fix + biome format) → `check:parallel` (typecheck + depcruise + knip) |
| `commit-msg` | `commitlint --edit` で Conventional Commits 検証（scope は `.project-config.yml` と同期） |

設定ファイル:
- `.oxlintrc.json` — oxlint
- `biome.json` — Biome (formatter only)
- `.dependency-cruiser.cjs` — FSD レイヤールール
- `knip.json` — dead code 検出
- `.lintstagedrc.json` — staged ファイル処理
- `commitlint.config.cjs` — commit message 規約

## コード規約

### Container/Hook/Presenter (#43)

mutation や 3 個以上の useState、async handler を持つ view は **Container (route file) / Hook (`useXxx.ts`) / Presenter (`XxxView.tsx`)** に分離する。

- View は **pure Presenter**: props in / JSX out のみ。useState / useEffect / mutation 直呼び禁止
- Hook (`useXxx.ts`) が state + handler を担う、`router.invalidate()` で loader 再取得
- Route file が Container 役: `Route.useLoaderData()` → `useXxx(input)` → `<XxxView {...data} {...hookProps} />`

oxlint で機械強制（`*DetailView.tsx` / `*AddView.tsx` / `*CreateView.tsx` で `useState` / `useEffect` / `useReducer` の import 禁止、全 `*View.tsx` で entity mutation の import 禁止）。**List view (filter state のみ) は inline 維持 OK**。

### JSDoc 必須対象

以下の export には JSDoc コメント必須（lint で機械強制はしないが、レビューで確認する）。

- **Custom hook** (`use*` プレフィックス): 担当する state / 副作用 / mutation / navigation を簡潔に記載
- **Entity API** (`src/entities/*/api/**`): 何を返すか、引数の意味、副作用 (mutation の場合)、Phase C で server fn 化時の note があれば

```ts
/**
 * KitDetailView 用の Hook。
 * 担当する state / 副作用:
 * - 購入ダイアログの表示状態 (useState)
 * - addKitEvent({ delta: +1, reason: 'purchase' }) の呼び出し
 * - mutation 後は router.invalidate() で loader 再実行
 */
export function useKitDetail(input: ...): ... { ... }
```

### デザインシステム (ADR-0002)

UI は **MUI v7 + Emotion** を採用。判断ルールは **Material Design 3** ガイドラインを参照する。

- 公式 docs: https://m3.material.io/ (色 / typography / spacing / elevation / state layer の規約)
- MUI docs: https://mui.com/material-ui/ (component の API / sx prop の書き方)
- pla-stock のトーン: **道具感 (Linear / Notion 風)** = neutral / monochrome バリアント、彩度低め

判断時の優先順:
1. M3 ガイドライン (色の意味論、コンポーネント階層)
2. MUI docs (具体 API)
3. `src/theme/tokens.ts` (M3 準拠の token 実体)

### Emotion 隔離方針 (#43-style 機械強制)

MUI v7 は内部 engine に Emotion を使うが、**user code は MUI 抽象しか触らない**。将来 Pigment CSS 等への engine 切替時に user code 書換を最小化するため。

| ルール | 内容 |
|---|---|
| 1 | styling は MUI の `sx` prop で |
| 2 | `styled()` は `@mui/material/styles` から (NEVER `@emotion/styled`) |
| 3 | `@emotion/*` の直接 import 禁止 (oxlint 機械強制) |
| 4 | theme tokens は `src/theme/` に集約 (engine 非依存の plain TS object) |
| 5 | `createTheme()` 引数は M3 schema 準拠 |
| 6 | `<ThemeProvider>` は `@mui/material/styles` から (NEVER `@emotion/react`) |

ルール 3 は `lint-config/oxlint-emotion-isolation.jsonc` で `no-restricted-imports` 強制。違反すると pre-commit / CI で reject。
