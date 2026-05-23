# pla-stock

プラモデル・塗料の在庫管理ツール。

**MVP スコープ**: プラモデル（キット）管理 + 塗料管理の 2 ドメイン。消耗品（ヤスリ・マスキング・軟化剤など）は v2 以降。

**ステータス**: Phase A-2 完了、**Phase C 着手中**。フレームワーク (TanStack Start / MUI v7 / Clerk / Drizzle + D1) は導入済み。`entities/<x>/schema.ts` を SSoT として kit / paint / project の read query + mutation は Drizzle + D1 server fn に完全移行済み。`entities/<x>/api/seed/` の data は dev seed 専用 (production runtime 非対象、`src/shared/lib/db/seed.ts` からのみ参照)。

---

## 🛑 必ず最初に読むこと: Skill 起動ルール

このプロジェクトは `.claude/skills/` 配下のスキルを **状況トリガー** で必ず起動する運用。
「呼べる」ではなく「呼ばねばならない」。**Skill ツールで明示起動**することで手順省略を防ぐ。

> **記憶 (file memory) ルール**: 本プロジェクトの記憶は skill ではなく本ルールに従う。
> global `~/.claude/CLAUDE.md` の memory skill 起動指示は **本プロジェクトでは本節が優先**
> （指示優先順位: project CLAUDE.md > global）。memory 操作のための skill 起動は不要。
>
> - 判断の前に file memory（memory ディレクトリの `MEMORY.md` 索引 + 型別エントリ
>   `user`/`feedback`/`project`/`reference`）を確認する
> - 保存基準: 「次セッションで同じ状況に遭遇したとき判断が速くなるか」が YES なら保存
> - 設計判断は ADR 一本化（`docs/adr/`）。memory への二重保存はしない
> - 詳細は `docs/harness-map.md`（ADR-0009）

**セッション開始時**: file memory（memory ディレクトリの `MEMORY.md` + 型別エントリ）を確認し、過去の決定・好み・失敗事例を把握する（skill 起動不要・本ルール参照）。

<!-- gen:skill-index start -->
### トリガー表（このトリガーに該当したら即 Skill 起動）

| トリガー | 起動する Skill | 種別 |
|---|---|---|
| 技術選定・アーキテクチャ変更・代替案比較の末に設計判断を下したとき、design-decision 外で単独記録する場合や既存 ADR を Supersede するとき | `adr` | atomic |
| 品質ツールの設定・実行タイミングを決めるとき、または lint・未使用コード・依存違反エラーに遭遇したとき | `code-quality` | atomic |
| コミットメッセージを書くとき、ブランチを作成するとき、または type/scope/命名規則に迷ったとき | `conventional-commits` | atomic |
| ライブラリ選定・DB 設計・アーキテクチャ変更など、後から理由を問われうる設計判断が brainstorming 中に発生したとき | `design-decision` | orchestrator |
| 実装が一段落し、コミット・PR 作成に向けて仕上げ作業を始めるとき | `dev-complete` | orchestrator |
| Issue に着手する直前、ブランチ作成や仕様確認などのコンテキスト準備を始めるとき | `dev-start` | orchestrator |
| ドキュメントを追加・更新するとき、生成物と手動ドキュメントの役割分担に迷ったとき、または CI の docs 差分チェックが失敗したとき | `docs-freshness` | atomic |
| エージェントが同じミスを繰り返した・ユーザーに訂正された・レビューで指摘を受けたとき | `failure-record` | atomic |
| Issue を作成・階層付けするとき、PR を立てるとき、または GitHub Projects のステータスを更新するとき | `github-flow` | atomic |
| コードレビューの指摘を受け取った直後、対応と再発防止の流れを開始するとき | `post-review` | orchestrator |
| 新しいリポジトリを作成し dev-skills 標準でブートストラップするとき | `project-bootstrap` | orchestrator |
| rule-improve の直後、または rule-improvement ラベルの未精査 Issue があるとき | `rule-audit` | atomic |
| failure-record に FAIL エントリを追記した直後、またはユーザーから「ルールを改善して」と依頼されたとき | `rule-cycle` | orchestrator |
| rule-cycle オーケストレーターから rule-measure 直後に subagent dispatch する直前 | `rule-explore` | atomic |
| rule-explore の直後、measure と explore の結果をもとに改善提案を Issue 化するとき | `rule-improve` | atomic |
| rule-cycle オーケストレーターから subagent dispatch する直前 | `rule-measure` | atomic |
| 新機能の設計を始めるとき、仕様書から実装へ移行するとき、または JSDoc / typedoc による仕様記述に迷ったとき | `sdd` | atomic |
| dev-complete オーケストレーターから subagent dispatch する直前 | `self-review` | atomic |
| 新規 test file (*.test.ts / *.test.tsx) を作成するとき、または既存 test を更新するとき | `testing` | atomic |
| 新規 Issue を立てる時、既存 Issue を整える時、Epic に sub-issue をぶら下げる時 | `writing-issues` | atomic |
| 新しい skill を追加・編集するとき、既存 skill を点検するとき、または description や構造に迷ったとき | `writing-project-skills` | atomic |

### オーケストレーション系（単一責務 skill を連鎖）

- **design-decision** → adr
- **dev-complete** → docs-freshness, conventional-commits, github-flow
- **dev-start** → github-flow, sdd
- **post-review** → dev-complete, failure-record
- **project-bootstrap** → code-quality, conventional-commits, github-flow, sdd, adr
- **rule-cycle** → rule-improve, rule-audit

### 単一責務系（atomic）

`adr` `code-quality` `conventional-commits` `docs-freshness` `failure-record` `github-flow` `rule-audit` `rule-explore` `rule-improve` `rule-measure` `sdd` `self-review` `testing` `writing-issues` `writing-project-skills`

> 実作業の主役の一部は superpowers **plugin** skill（`brainstorming` /
> `writing-plans` / `subagent-driven-development` / `systematic-debugging` /
> `requesting-code-review`）で、project frontmatter 管理外。plugin 参照は
> orchestrator の subskills に `plugin:` 接頭辞で記す。
<!-- gen:skill-index end -->

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
- **コミット前は必ず `dev-complete` Skill を起動**（self-review subagent dispatch → docs-freshness → commit）。手で `git commit` するだけは NG
- コミットメッセージは Conventional Commits（scope は `.project-config.yml` の enum を参照）
- **narrative は日本語で記述する**：コミット本文 / PR タイトル&本文 / Issue タイトル&本文 / ドキュメント。`type(scope):` プレフィックスとコード内識別子（変数名・関数名）は英語のまま、技術用語の英語混在も OK。
- PR は必ず関連 Issue を `Closes #XX` で紐付ける
- 型定義変更時は JSDoc も同時に更新する（SDD ルール: 実装後は型 + JSDoc が SSoT）
- テストの設計と書き方は **ADR-0016** と `testing` skill が SSoT (Testing Trophy 採用、coverage 不採用、co-location)
- **seed と test fixture の役割境界**: `src/entities/<x>/api/seed/` は dev seed 専用データ (`src/shared/lib/db/seed.ts` から D1 投入)、production からの import は depcruise `no-seed-from-production` で機械強制禁止。test 用の data は `src/test-utils/factories/<entity>.ts` の `createTest<Entity>(overrides)` を使う (ADR-0016)
- 設計判断があったら **`design-decision` Skill を起動**（ADR 追加、ADR が SSoT）
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
| `pnpm lint:deprecated` | oxlint type-aware で deprecated API 使用を検出 (ADR-0015) |
| `pnpm format` | biome で format チェック (no-write) |
| `pnpm format:write` | biome で全ファイル整形 |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm depcruise` | dependency-cruiser で FSD レイヤー違反/循環依存を検出 |
| `pnpm knip` | knip strict で未使用 export/file を検出 |
| `pnpm check:test-coverage` | testing skill ルール 2/3 対象に `*.test.{ts,tsx}` 併設があるか機械検証 (warning モード、`--strict` で error 化) |
| `pnpm check:parallel` | typecheck + depcruise + knip + harness + deprecated + test-coverage を並列実行 (pre-commit 用) |
| `pnpm check` | lint → lint:deprecated → format → typecheck → depcruise → knip → harness → test-coverage を直列実行 (CI 用) |
| `pnpm db:generate` | drizzle-kit で schema から migration SQL を生成 (`drizzle/migrations/`) |
| `pnpm db:migrate:local` | local D1 (`.wrangler/state/...`) に migration を適用 |
| `pnpm db:migrate:remote` | prod D1 に migration を適用 (`--remote`) |
| `pnpm db:studio` | drizzle-kit studio で DB を GUI 閲覧 |

Node バージョンマネージャ使用時は `nvm use` / `fnm use` / `volta pin` で `.nvmrc` に追従。

## Git Hooks

**husky v9 + lint-staged + commitlint で導入済**（ADR-0001 参照）。

| Hook | 内容 |
|---|---|
| `pre-commit` | `lint-staged` (oxlint --fix + biome format) → `check:parallel` (typecheck + depcruise + knip + harness + deprecated) |
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

**現状の enforcement**: TanStack Router の `useLoaderData` が route 階層で呼ぶ前提の API であることから、Container/Hook/Presenter は実質「ライブラリ設計の自然な誘導 + 人間レビュー」で担保されている。`lint-config/oxlint-view-purity.jsonc` に oxlint の `no-restricted-imports` ルール（`*DetailView.tsx` / `*AddView.tsx` / `*CreateView.tsx` の `useState` 等 / 全 `*View.tsx` の entity mutation）も置いているが、`paths + importNames` 形式が oxlint 1.61 で機能しておらず**現状は機械強制が paper tiger**（FAIL-005 / ADR-0007 / 修復は #155）。**List view (filter state のみ) は inline 維持 OK**。

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

### デザインシステム (ADR-0002 / `docs/specs/2026-04-29-design-direction.md`)

UI は **MUI v7 + Emotion** を採用。判断ルールは **Material Design 3** ガイドラインを参照する。

- 公式 docs: https://m3.material.io/ (色 / typography / spacing / elevation / state layer の規約)
- MUI docs: https://mui.com/material-ui/ (component の API / sx prop の書き方)
- pla-stock の方向性 (Tone / Differentiation 等) は **`docs/specs/2026-04-29-design-direction.md`** に確定 (Refined Minimalism + 塗料 color swatch 差別化、primary は M3 green)
- UI 変更時は **`frontend-design` skill を invoke** して spec 方針との整合性確認

判断時の優先順:
1. M3 ガイドライン (色の意味論、コンポーネント階層)
2. MUI docs (具体 API)
3. `src/theme/tokens.ts` (M3 準拠の token 実体)

### Toast 通知

mutation 成功 / 失敗、検証エラー等は **notistack の Snackbar** で通知する。

- React コンポーネント内: `const { enqueueSnackbar } = useSnackbar()`
- 非 React 文脈 (loader / route handler): `import { enqueueSnackbar } from 'notistack'`
- variant: `'success' | 'error' | 'warning' | 'info' | 'default'`
- `window.alert` / `console.warn` を user-facing 通知に使わない (debug 用は OK)

### Loading 表示

route 遷移中の loader 待機は **TanStack Router の `pendingComponent`** で画面上部に MUI `<LinearProgress>` を表示。
mutation 中の button は `disabled + <CircularProgress size={16} />` パターン (既存実装のまま継続)。

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

### Form パターン (ADR-0003)

Form は **TanStack Form + MUI TextField/Select**、`<FormTextField field={...} />` / `<FormSelect field={...} options={...} />` 経由で統一。詳細 ADR-0003。

### Domain schema (ADR-0008、ADR-0005 を Supersede)

ドメインのテーブル定義・列・enum values・派生型は **`entities/{domain}/schema.ts`** に Drizzle table として集約する (SSoT)。UI 表示用 label のみ `entities/{domain}/model.ts` に置く。

```ts
// entities/kit/schema.ts (SSoT)
export const KIT_EVENT_REASONS = ['purchase', 'project', 'gift', 'sell', 'discard', 'other'] as const
export const kitEvents = sqliteTable('kit_events', {
  // ...
  reason: text('reason', { enum: KIT_EVENT_REASONS }).notNull(),
})
export type KitEvent = typeof kitEvents.$inferSelect
export type KitEventReason = (typeof KIT_EVENT_REASONS)[number]

// entities/kit/model.ts (UI labels のみ)
export type { KitEvent, KitEventReason } from './schema'
export const KIT_EVENT_REASON_LABELS = {
  purchase: '購入', project: 'プロジェクト', /* ... */
} as const satisfies Record<KitEventReason, string>
```

中間テーブル (M:N) は **専用 entity ディレクトリ** を切る (例: `entities/projectPaintUse/schema.ts`)。この entity だけが両端 entity の schema を import してよい。

利用側は entity barrel (`~/entities/{domain}`) 経由で値・型・labels を取り出し、UI 専用 subset (例: release だけで使う reasons) は dialog 内に `as const satisfies readonly KitEventReason[]` で型整合だけ守って宣言。同 subset を 2 箇所以上で使うなら entity 側に昇格させる。

timestamp の 2 種類区別:
- **時点 (instant)** `createdAt` 等 → `integer({ mode: 'timestamp_ms' })`、boundary は **`Date`**
- **カレンダー日付** `purchasedAt` / `startedAt` 等 → `text('purchased_at')`、boundary は **`string`** ('YYYY-MM-DD')

機械強制はせず convention 運用。AI エージェントが本規約に違反した場合は ADR-0007 に FAIL エントリとして追記し `failure-record` → `rule-cycle` で再発防止サイクルを回す。詳細 ADR-0006 / ADR-0008 / ADR-0007。

### 型アサーション・三項ネスト禁止 (PR #56 レビュー由来)

oxlint で機械強制（`lint-config/oxlint-base.jsonc`）。

- **`value as Foo` 形の型アサーション禁止** (`consistent-type-assertions: never`)
  - 代替: 型 narrowing (`typeof`, `'in'`, type guard 関数), `as const`, `satisfies`
  - `as const` は本ルールの例外として許可される (TS の特殊形)
  - 真にやむを得ない箇所は `// oxlint-disable-next-line consistent-type-assertions -- 理由` で 1 行ずつ disable し、必ず理由コメントを付ける
- **三項演算子のネスト禁止** (`no-nested-ternary`)
  - 代替: if/return 早期 return、ヘルパ関数化、map lookup

### 1 文字変数禁止 (PR #56 レビュー由来)

`id-length: { min: 2, exceptions: ['_'] }` で機械強制。

- `e` (event), `p` (paint/project/part), `o` (option) 等の単文字省略は禁止
- 文脈に応じて意味のある名前を付ける (`event` / `paint` / `option` 等)
- 例外は `_` (意図的未使用の destructured 変数) のみ

### 明示的 any 禁止 (ユーザーレビュー指摘 (b) 由来)

`typescript/no-explicit-any: error` で機械強制 (`lint-config/oxlint-base.jsonc`)。

- 関数引数 / 戻り値 / 変数注釈で `any` を使うのは禁止
- 代替: 正確な型注釈、`unknown` + type narrowing、generics、型 import (React の `children` は `ReactNode` 等)
- 真にやむを得ない箇所は `// oxlint-disable-next-line typescript/no-explicit-any -- 理由` で 1 行 disable + 理由コメント

## AI 運用ルール

物理的なガード (force push 禁止 / 本番 deploy 禁止 / secret 編集禁止 等) は `.claude/settings.json` で deny / ask 機械強制。以下は **機械強制できない判断系 + 半機械強制 (hook で run を強制) の規律**:

- **UI 変更の push は機械強制で `pnpm verify:ui` 必須** (`.husky/pre-push` が以下を検出時、`.playwright-snapshots/` の鮮度をチェックして reject)
  - `src/(views|widgets|components)/**/*.{tsx,css,scss}` (Presenter / style。hook の `.ts` や test は対象外)
  - `src/(theme|styles)/**` (design token / global style は `.ts` でも対象)
  - 撮った screenshot を **controller 自身が必ず目視確認** (run しただけで OK は禁止、それは harness の趣旨に反する)
- **subagent の DONE 報告は独立検証**を経るまで信用しない (コード読み + 視覚確認 or test 実行)
- **DB 書込 mutation の spec/plan は UPSERT/batch × CHECK/UNIQUE/FK の相互作用を実機 SQL で再現確認必須** (FAIL-003 由来 / ADR-0007)
  - 机上の SQL 設計を merge 前提にしない。特に `INSERT ... ON CONFLICT DO UPDATE`: **SQLite は DO UPDATE 切替前に INSERT 候補行の CHECK を評価する**ため、INSERT 候補値は生 delta でなく最終結果値 (`(既存値 or 0) + delta`) にそろえる
  - **mutation PR は controller 自身がマージ前に制約違反系の手動 smoke を実施**してからユーザー確認に回す (ユーザー任せにしない)。必須境界ケース: 在庫 1→0 が成功 / 0→-1 が拒否され**台帳も増えない** (CHECK + batch rollback)
- **新規ライブラリ採用は ADR 起票必須** (`docs/adr/`)
- **UI コード変更前 (`.tsx` の styling / sx prop / 新規 component) は必ず `frontend-design` skill を invoke する**
  - 特に「**見た目に対する feedback**」(例: 「貧相」「派手」「狭すぎ」「変」) を受けた時、**反応的にパラメータ調整せず**、まず skill で Design Thinking (Tone / Differentiation / Constraints) を再適用する
  - spec (`docs/specs/2026-04-29-design-direction.md`) は方針、skill は **その実装局面での craft 適用ガイド**。両方必須

### Skill tool 起動の規律 (FAIL-002 由来 / ADR-0007)

トリガー表 (本ドキュメント冒頭) で「起動する Skill」と書かれているものは、**Skill tool で明示起動する**。skill 内に書かれた検証コマンドを `pnpm xxx` で手打ちしても skill 起動の代替にはならない。

特に以下は **コマンド手打ちでの代替を厳禁**:

| 起動が必須な skill | コマンド手打ちで代替できない理由 |
|---|---|
| `dev-complete` | Step 1 で `self-review` **subagent を Agent dispatch**、Step 2-4 で docs-freshness / conventional-commits / github-flow を **REQUIRED SUB-SKILL として連鎖呼出** する設計。手打ち / 部分起動では連鎖が起きず工程が抜ける |
| `self-review` (skill = dispatch reference) / **subagent** | 検証コマンド + 「**差分ファイルを新鮮な目で再読**」「ツールで検出できない懸念探索」を subagent が独立 context で実施。親 context のバイアスを排除するのが核心。skill は dispatch 手順の参考書 |
| `dev-start` | memory 検索 / Issue 確認 / ブランチ作成のオーケストレーション。手打ちで進めると memory 検索が抜けがち |
| `frontend-design` | Design Thinking (Tone / Differentiation / Constraints) の適用ガイド。skill を読み流して反応的に sx を弄ると craft が崩れる |

**Red Flag** (これが浮かんだら STOP — Skill tool 起動を省略しようとしているサイン):

- 「skill の内容は把握してるからコマンドだけで OK」 → 把握してても手順が抜ける。Skill tool 起動して checklist を毎回踏む
- 「docs / 軽微な変更だから self-review 軽くて OK」 → docs こそ grep カウント汚染等の落とし穴あり (FAIL-002 で実証)。重さは内容ではなく **省略を許さない態度** で決める
- 「`pnpm check:parallel` が pre-commit hook で走るから OK」 → hook は最後の砦であって self-review subagent dispatch の代替ではない。差分 re-read / paper tiger チェックは hook で代替できない
- 「task で `self-review` をマークしたから OK」 → タスク完了マークは記録、Agent tool での subagent dispatch が実行。両方必要

実装系タスクで TaskCreate を使う際は、**「Skill tool で `dev-complete` を起動」を独立タスクとして必ず切る** と、起動行為が可視化されて省略しにくくなる。

### `verify:ui` 運用

```sh
pnpm dev               # 別 terminal で dev server 起動
pnpm verify:ui         # screenshot 撮影 → .playwright-snapshots/ に保存
```

初回のみ chromium インストール: `pnpm exec playwright install chromium`

**重要な制約**: 現状 verify:ui は **LandingView (`/`) のみ対象**。Clerk 認証 gate 配下 (`/dashboard` 等) は screenshot 不可。  
**= verify:ui の OK = 「全画面 OK」ではない。** 認証 gate 内の dark mode / レイアウト / Action 配置は **controller がブラウザで目視確認** するか **ユーザーの screenshot を待つ** こと。LandingView だけで OK 判定するのは 2026-04-29 の失敗 (ai-failures.md 参照) と同じ過ち。
