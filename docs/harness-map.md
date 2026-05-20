# ハーネス地図

pla-stock の AI 運用ハーネスの全体像。skill 索引は `CLAUDE.md`
（`scripts/gen-skill-index.mjs` 生成・各 `SKILL.md` frontmatter が SSoT）を参照。

## 5 層構造

| 層 | 役割 | 強制手段 | 既知負債 |
|---|---|---|---|
| 静的 | 決定的・安価な機械検証 | husky 3 hook / oxlint 3 config / dep-cruiser / knip / biome / settings.json deny / **check-branch** / **check-harness** | — |
| 動的 | 振る舞いの正しさ | playwright verify:ui（**LandingView のみ**）+ controller 手動 smoke | verify:ui が Clerk 認証 gate を越えられない → spin-off (b)。unit test 基盤なし → spin-off (c) |
| 振り返り | ルール改善 | rule-cycle（FAIL+3 / 手動） | 発火が反応的・signal 未集約 → spin-off (a) |
| 統制 | skill 起動規律 | CLAUDE.md トリガー表（**frontmatter SSoT → 生成**）+ FAIL-002 規律 | proportionality / skill 内ループ遵守は未明文 |
| skill | 作業の型 | project 20 skill（kind 分類）+ check-harness | — |

## skill: project と plugin の境界

- **project skill**（`.claude/skills/`, 20, frontmatter 管理）: 本リポジトリ固有。
  `CLAUDE.md` の生成索引が一覧。内訳は **orchestrator 6 / atomic 14**
  （frontmatter `kind` が SSoT。`check-harness` が分類不変条件を機械検証）
  - orchestrator 6: `dev-start` `dev-complete` `post-review` `rule-cycle`
    `project-bootstrap` `design-decision`
  - atomic 14: `adr` `code-quality` `conventional-commits` `docs-freshness`
    `failure-record` `github-flow` `rule-audit` `rule-explore` `rule-improve`
    `rule-measure` `sdd` `self-review` `writing-issues` `writing-project-skills`
- **plugin skill**（superpowers, frontmatter 管理外・参照のみ）: 実作業の主役。
  `brainstorming` `writing-plans` `subagent-driven-development`
  `systematic-debugging` `requesting-code-review` 等。project orchestrator が
  連鎖する場合 `subskills` に `plugin:` 接頭辞で明示
- 生成索引は project 20 のみを写すため、本ドキュメントが plugin 主役の存在を
  補完する（「project 20 が全て」という誤読を防ぐ）

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
