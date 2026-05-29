# ハーネス地図

pla-stock の AI 運用ハーネスの全体像。skill / command 一覧は Claude Code の
session 開始時 system-reminder と CLAUDE.md `Skill / Command 一覧` を参照
（各 SKILL.md / commands/*.md の frontmatter が SSoT、#227 でトリガー表生成は廃止）。

俯瞰図 (drawio): [`docs/diagrams/harness-map.drawio`](./diagrams/harness-map.drawio) — 3 ページ構成
(Page 1 = 5 層 × 機構マトリクス / Page 2 = orchestrator 連鎖 flowchart /
Page 3 = Legend + 起動契機 + 関連 ADR)。本 markdown が SSoT、drawio は視覚化。
drawio.com / VS Code 拡張で閲覧。**ADR-0024 で commands→skills 統一 + rules 追加に整合済**。

## 5 層構造

| 層 | 役割 | 強制手段 | 既知負債 |
|---|---|---|---|
| 静的 | 決定的・安価な機械検証 | husky 3 hook / oxlint 3 config / dep-cruiser / knip / biome / **settings.json 権限ポリシー (ADR-0011)** / **check-branch** | — |
| 動的 | 振る舞いの正しさ | playwright verify:ui（**LandingView のみ**）+ controller 手動 smoke | verify:ui が Clerk 認証 gate を越えられない → spin-off (b)。unit test 基盤なし → spin-off (c) |
| 振り返り | ルール改善 | `/rule-cycle`（FAIL+3 / 手動） | 発火が反応的・signal 未集約 → spin-off (a) |
| 統制 | skill 起動規律 + path-scoped rules | CLAUDE.md `Skill / Rule / Agent 一覧` + `.claude/rules/<topic>-discipline.md` (ADR-0024) + FAIL-002 規律 | proportionality / skill 内ループ遵守は未明文 |
| skill (統一) | 作業の型 + 儀式 (orchestration only、規約本文は docs/rules/ 参照) | atomic 12 + orchestrator 5 (`.claude/skills/`、stakes 別 disable-model-invocation、ADR-0024) + subagent 4。frontmatter は Claude Code 公式形式のみ | 俯瞰図は ADR-0024 で更新済 (PR #238 drawio + 本 markdown) |

## skill / command: project と plugin の境界

- **orchestrator skill (stakes 別 user-only)**（`.claude/skills/<name>/SKILL.md`, 5、frontmatter 管理）: 儀式型。stakes 別に `disable-model-invocation` を設定 (ADR-0024)。
  - **AI 可** (`disable-model-invocation: false`、stakes 低): `dev-start`
  - **user-only** (`disable-model-invocation: true`、儀式、FAIL-002 防御): `dev-complete` `post-review` `design-decision` `rule-cycle`
- **atomic skill**（`.claude/skills/`, 12, frontmatter 管理）: 本リポジトリ固有。
  description で AI auto-trigger + user `/name` どちらも可。`self-review` /
  `rule-measure` / `rule-explore` / `project-bootstrap` は **dispatch reference**
  (本体は `.claude/agents/` の subagent に集約)。
  **orchestration only 原則** (ADR-0018): 規約本文は `docs/rules/` 参照、
  skill 内には AI 手順 + Red Flag のみ
  - `code-quality` `conventional-commits` `docs-freshness`
    `github-flow` `project-bootstrap` `rule-audit` `rule-explore`
    `rule-improve` `rule-measure` `self-review` `testing` `writing-issues`
    (sdd は #111 で未使用判定により廃止、adr / failure-record / writing-project-skills は
    #180 で claude-handbooks plugin に切出済 — ADR-0022)
- **subagent**（`.claude/agents/`, 4）: 独立 context で実行する重い処理 / 新鮮な目。
  `self-review` `rule-measure` `rule-explore` `project-bootstrap` (#188 で
  subagent 化完了、Write tool 許可は project-bootstrap のみ)
- **plugin skill**（superpowers / claude-handbooks 等、frontmatter 管理外・参照のみ）:
  実作業の主役。superpowers: `brainstorming` `writing-plans` `subagent-driven-development`
  `systematic-debugging` `requesting-code-review` 等。claude-handbooks (v0.1.0+):
  `adr` `failure-record` `writing-skills` (汎用 handbook、ADR-0022)。
  project orchestrator が連鎖する場合 `<plugin>:<skill>` namespace で明示参照
- **path-scoped rules**（`.claude/rules/<topic>-discipline.md`, 2、frontmatter 管理）: ADR-0024 で新設。matching file 時のみ load。
  - `ui-discipline.md` (paths: src/(views|widgets)/**/*.{tsx,css,scss}, src/theme/**, src/styles/**) — frontend-design skill + verify:ui 規律
  - `db-discipline.md` (paths: src/entities/**/schema.ts, src/shared/lib/db/**, src/features/**/api/mutations/**) — FAIL-003 smoke 規律

## 権限ポリシー (ADR-0011)

`.claude/settings.json` は **10 カテゴリ × {deny, ask, allow}** マトリクスで構成。
destructive (git / fs / gh) と secret / prod / harness-config を **deny**、相対 `rm`・
destructive gh・pkg 操作を **ask**、read-only verify (pnpm lint/typecheck/knip/check
系) を **allow** に集約。global `~/.claude/**` 編集は機械保護される。詳細・選択肢の
比較・拡張ルールは ADR-0011。新カテゴリの追加や read-only allow の拡張は
`fewer-permission-prompts` skill 経由で行う。

## docs/rules/ (人間 + AI 共通の SSoT、ADR-0018 v2)

現状の運用手順・アーキテクチャ・規約は **`docs/rules/`** が SSoT (topic-based 13 ファイル)。
skill / CLAUDE.md は規約本文を持たず docs/rules/ を参照する立場。

- 規約変更 workflow: ADR 記録 → 実装 → docs/rules/ 更新 (詳細 docs/rules/adr-policy.md)
- 詳細は ADR-0018 (SSoT 境界規約) と docs/rules/docs-policy.md

## 記憶 (file memory)

memory は skill ではなく `CLAUDE.md` の「記憶 (file memory) ルール」節に従う
（旧 `memory-usage` skill / claude-memory MCP は廃止、ADR-0009）。global
`~/.claude/CLAUDE.md` の memory skill 指示より project 本ルールが優先。

## 振り返り自動化の方針

rule-cycle の改変系の終端は **GitHub Issue（改変提案）**。`rule-audit` の
人間ゲート（`approved` ラベル）を維持し、AI が無人で skill/CLAUDE.md を
改変することは構造的に不可。発火自動化と signal 集約は spin-off (a)。

## spin-off Issue

- (a) 振り返り発火自動化 + signal 集約（rule-cycle 強化）
- (b) verify:ui を Clerk 認証貫通（@clerk/testing）で動的層復旧
- (c) unit test 基盤（純粋関数中心）
- (d) 多重 SSoT 整理（specs/plans/memory/CLAUDE.md/lint-config）→ Issue #111 で完了 (ADR-0018 v2 + docs/rules/ 導入)
