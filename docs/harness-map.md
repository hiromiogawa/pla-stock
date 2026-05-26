# ハーネス地図

pla-stock の AI 運用ハーネスの全体像。skill / command 一覧は Claude Code の
session 開始時 system-reminder と CLAUDE.md `Skill / Command 一覧` を参照
（各 SKILL.md / commands/*.md の frontmatter が SSoT、#227 でトリガー表生成は廃止）。

## 5 層構造

| 層 | 役割 | 強制手段 | 既知負債 |
|---|---|---|---|
| 静的 | 決定的・安価な機械検証 | husky 3 hook / oxlint 3 config / dep-cruiser / knip / biome / **settings.json 権限ポリシー (ADR-0011)** / **check-branch** / **check-harness** | — |
| 動的 | 振る舞いの正しさ | playwright verify:ui（**LandingView のみ**）+ controller 手動 smoke | verify:ui が Clerk 認証 gate を越えられない → spin-off (b)。unit test 基盤なし → spin-off (c) |
| 振り返り | ルール改善 | `/rule-cycle`（FAIL+3 / 手動） | 発火が反応的・signal 未集約 → spin-off (a) |
| 統制 | skill / command 起動規律 | CLAUDE.md `Skill / Command 一覧` (手動 + system-reminder) + FAIL-002 規律 | proportionality / skill 内ループ遵守は未明文 |
| skill / command | 作業の型 | project orchestrator 5 (commands) + atomic 16 (skills、dispatch reference 含む) + subagent 4、`check-harness` が分類不変条件を機械検証 | 俯瞰図は #229 drawio で別途 |

## skill / command: project と plugin の境界

- **orchestrator command**（`.claude/commands/`, 5、frontmatter 管理）: 本物
  slash command (#227)。user 入力でしか起動できない構造的不可逆性。
  - `dev-start` `dev-complete` `post-review` `design-decision` `rule-cycle`
- **atomic skill**（`.claude/skills/`, 16, frontmatter 管理）: 本リポジトリ固有。
  description で AI auto-trigger + user `/name` どちらも可。`self-review` /
  `rule-measure` / `rule-explore` / `project-bootstrap` は **dispatch reference**
  (本体は `.claude/agents/` の subagent に集約)
  - `adr` `code-quality` `conventional-commits` `docs-freshness`
    `failure-record` `github-flow` `project-bootstrap` `rule-audit` `rule-explore`
    `rule-improve` `rule-measure` `sdd` `self-review` `testing` `writing-issues`
    `writing-project-skills`
- **subagent**（`.claude/agents/`, 4）: 独立 context で実行する重い処理 / 新鮮な目。
  `self-review` `rule-measure` `rule-explore` `project-bootstrap` (#188 で
  subagent 化完了、Write tool 許可は project-bootstrap のみ)
- **plugin skill**（superpowers, frontmatter 管理外・参照のみ）: 実作業の主役。
  `brainstorming` `writing-plans` `subagent-driven-development`
  `systematic-debugging` `requesting-code-review` 等。project orchestrator が
  連鎖する場合 `subskills` に `plugin:` 接頭辞で明示

## 権限ポリシー (ADR-0011)

`.claude/settings.json` は **10 カテゴリ × {deny, ask, allow}** マトリクスで構成。
destructive (git / fs / gh) と secret / prod / harness-config を **deny**、相対 `rm`・
destructive gh・pkg 操作を **ask**、read-only verify (pnpm lint/typecheck/knip/check
系) を **allow** に集約。global `~/.claude/**` 編集は機械保護される。詳細・選択肢の
比較・拡張ルールは ADR-0011。新カテゴリの追加や read-only allow の拡張は
`fewer-permission-prompts` skill 経由で行う。

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
- (d) 多重 SSoT 整理（specs/plans/memory/CLAUDE.md/lint-config）
