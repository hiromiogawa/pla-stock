# pla-stock

プラモデル・塗料の在庫管理ツール。MVP スコープはプラモデル (キット) + 塗料の 2 ドメイン (消耗品は v2 以降)。

**ステータス**: Phase A-2 / C / D 完了、Phase F (本番 deploy) 稼働中 (https://pla-stock.hiromi-ogawa-1223.workers.dev)。

このファイルは **AI セッション開始時に必読の global 規律** と **規約への目次** に絞る。具体的な規約は `docs/rules/` 配下、path-scope な動作規範は `.claude/rules/` 配下、設計判断の歴史は `docs/adr/` 配下が SSoT (ADR-0018 / ADR-0024)。

---

## 🛑 必ず最初に読むこと: Skill 起動ルール

このプロジェクトは `.claude/skills/` 配下の skill / `.claude/rules/` 配下の path-scope 規範 / `.claude/agents/` 配下の subagent を **状況トリガー** で必ず起動・参照する運用 (ADR-0024)。

> **記憶 (file memory) ルール**: 本プロジェクトの記憶は memory skill ではなく本ルールに従う。global `~/.claude/CLAUDE.md` の memory skill 起動指示は **本プロジェクトでは本節が優先** (指示優先順位: project CLAUDE.md > global)。memory 操作のための skill 起動は不要。
>
> - 判断の前に file memory (memory ディレクトリの `MEMORY.md` 索引 + 型別エントリ) を確認する
> - 保存基準: 「次セッションで同じ状況に遭遇したとき判断が速くなるか」が YES なら保存
> - 設計判断は ADR 一本化 (`docs/adr/`)。memory への二重保存はしない
> - 詳細は `docs/harness-map.md` (ADR-0009)

**セッション開始時**: file memory (memory ディレクトリの `MEMORY.md` + 型別エントリ) を確認し、過去の決定・好み・失敗事例を把握する (skill 起動不要・本ルール参照)。

### Skill / Rule / Agent 一覧 (ADR-0024)

Claude Code は session 開始時に **system-reminder** で全 skill / rule / agent の description を context 注入する。AI は description を見て起動判断する。

| 機構 | 配置 | 起動 |
|---|---|---|
| **orchestrator skill (user-only)** | `.claude/skills/<name>/SKILL.md` の `disable-model-invocation: true` (`/dev-complete` `/post-review` `/design-decision` `/rule-cycle`) | user 入力のみ (儀式、構造的に AI auto-trigger 不可、ADR-0024) |
| **orchestrator skill (AI 可)** | `.claude/skills/dev-start/SKILL.md` の `disable-model-invocation: false` | AI auto-trigger or user `/dev-start` (stakes 低、ADR-0024) |
| **atomic skill** | `.claude/skills/<name>/SKILL.md` (code-quality / conventional-commits / docs-freshness / github-flow / project-bootstrap / testing / writing-issues / self-review / rule-measure / rule-explore / rule-improve / rule-audit) | AI auto-trigger or user `/name` |
| **path-scoped rules** | `.claude/rules/<topic>-discipline.md` の `paths:` frontmatter (`ui-discipline` / `db-discipline`) | matching file が context に入った時のみ自動 load (ADR-0024) |
| **plugin skill (handbook)** | `claude-handbooks:adr` / `claude-handbooks:failure-record` / `claude-handbooks:writing-skills` (汎用 handbook、外部 plugin v0.1.0+、ADR-0022) | AI auto-trigger |
| **subagent** | `.claude/agents/<name>.md` (self-review / rule-measure / rule-explore / project-bootstrap) | Agent tool で dispatch (独立 context、Write tool は project-bootstrap のみ許可) |

orchestrator の連鎖関係 (各 `.claude/skills/<name>/SKILL.md` body 中の言及が SSoT):

- **`/dev-start`** → github-flow (+ docs/rules/branch.md)
- **`/dev-complete`** → docs-freshness, conventional-commits, github-flow (+ self-review subagent)
- **`/post-review`** → dev-complete, failure-record
- **`/design-decision`** → adr
- **`/rule-cycle`** → rule-improve, rule-audit (+ rule-measure / rule-explore subagent)

実作業の主役の一部は superpowers **plugin** skill (`brainstorming` / `writing-plans` / `subagent-driven-development` / `systematic-debugging` / `requesting-code-review`) で project frontmatter 管理外。

---

## 📖 規約 / 仕様の目次 (逆引き index)

**規約は `docs/rules/` が SSoT** (人間 + AI 共通の現状形)。**経緯 / 決定は `docs/adr/`** (不変、歴史)。**path-scoped 動作規範は `.claude/rules/`** (AI のみ、ADR-0024)。

| Topic | 規約 (現状形) | 関連 ADR / 機械強制 |
|---|---|---|
| アーキテクチャ (FSD + Container/Hook/Presenter) | [docs/rules/architecture.md](./docs/rules/architecture.md) | ADR-0019、`.dependency-cruiser.cjs` |
| UI パターン (Form / Toast / Loading / Emotion 隔離) | [docs/rules/ui-patterns.md](./docs/rules/ui-patterns.md) | ADR-0002 / 0003 / 0020、`lint-config/oxlint-emotion-isolation.jsonc` |
| Domain modeling (Drizzle schema SSoT / timestamp) | [docs/rules/domain-modeling.md](./docs/rules/domain-modeling.md) | ADR-0006 / 0008、`.dependency-cruiser.cjs` |
| Linting (型 4 ルール) | [docs/rules/linting.md](./docs/rules/linting.md) | ADR-0021 / 0015、`lint-config/oxlint-base.jsonc` |
| Code quality (lint / format / hooks / コマンド一覧) | [docs/rules/code-quality.md](./docs/rules/code-quality.md) | ADR-0001、`.husky/`、`lint-config/` |
| Commit 規約 (Conventional Commits / scope) | [docs/rules/commit.md](./docs/rules/commit.md) | `lint-config/commitlint-config.cjs`、`.project-config.yml` |
| Branch / PR / Issue 階層 | [docs/rules/branch.md](./docs/rules/branch.md) | `scripts/check-branch.mjs` |
| Issue 書き方 (Type 別) | [docs/rules/issue.md](./docs/rules/issue.md) | `.github/ISSUE_TEMPLATE/` |
| Testing (Trophy / factory / coverage gate) | [docs/rules/testing.md](./docs/rules/testing.md) | ADR-0016 / 0017、`vitest.config.ts` |
| ADR policy + 「ADR → 実装 → rules 更新」workflow | [docs/rules/adr-policy.md](./docs/rules/adr-policy.md) | ADR-0007 / 0009 / 0018 |
| Docs 構造 + SSoT 境界 | [docs/rules/docs-policy.md](./docs/rules/docs-policy.md) | ADR-0018 |
| Skill 規約 (orchestration only + stakes 別 disable-model-invocation) | [docs/rules/skill-authoring.md](./docs/rules/skill-authoring.md) | ADR-0018 / ADR-0024 |

AI 動作規範 (path-scoped、`.claude/rules/`、ADR-0024):

- `ui-discipline.md` (UI 編集時の規律、paths: src/(views\|widgets)/**/*.{tsx,css,scss}, src/theme/**, src/styles/**)
- `db-discipline.md` (DB schema/mutation 編集時の規律、paths: src/entities/**/schema.ts, src/shared/lib/db/**, src/features/**/api/mutations/**)

その他:

- 規約索引: [docs/rules/README.md](./docs/rules/README.md) (rules 全体 + workflow)
- 設計判断の歴史: [docs/adr/README.md](./docs/adr/README.md) (索引、自動生成)
- 失敗事例 live log: [docs/adr/0007-agent-failure-rules.md](./docs/adr/0007-agent-failure-rules.md)
- ハーネス俯瞰: [docs/harness-map.md](./docs/harness-map.md)
- ドメインモデル俯瞰: [docs/diagrams/domain-model.drawio](./docs/diagrams/domain-model.drawio) (drawio.com / VS Code 拡張で閲覧、PNG/SVG は手動 export)
- デザイン方向性: [docs/specs/2026-04-29-design-direction.md](./docs/specs/2026-04-29-design-direction.md)
- 開発環境セットアップ / 本番 deploy: [README.md](./README.md)

---

## ローカル専用ファイル

- `docs/superpowers/` — AI 向けの一過性の設計メモ / 実装計画 (`.gitignore` で除外、公開 repo に含めない)

---

## AI 運用ルール (global、skill 化するまでもない都度判断)

物理ガード (force push / 本番 deploy / secret 編集禁止) は `.claude/settings.json` で deny / ask 機械強制 (ADR-0011)。以下は **AI が毎セッション読む** global 規律 (path-scope は `.claude/rules/<topic>-discipline.md` 参照):

- **main / master への直接コミット禁止**: 編集前に `git branch --show-current` を確認、main なら **`/dev-start <issue>` を起動** して feature branch (AI auto-trigger 可、ADR-0024)
- **commit 前は必ず user に `/dev-complete` を依頼**: 内部で self-review subagent dispatch → docs-freshness → conventional-commits → github-flow が連鎖実行される。AI 単独で `git commit` は NG
- **narrative は日本語**: コミット本文 / PR / Issue / docs。`type(scope):` プレフィックスとコード内識別子は英語のまま
- **PR は必ず `Closes #<issue>` で Issue を紐付ける**
- **新規ライブラリ採用は ADR 起票必須** (`docs/adr/`)
- **設計判断があったら user に `/design-decision` を依頼** (ADR が SSoT、memory への二重保存禁止)
- **セルフレビュー / コードレビューの結果は PR コメントで残す** (`gh pr comment`、指摘 → 修正 → 修正内容を返信で記録)

### subagent の規律

- **subagent の DONE 報告は独立検証**を経るまで信用しない (コード読み + 視覚確認 or test 実行)

### Skill 起動の規律 (FAIL-002 / ADR-0007)

orchestrator skill (`.claude/skills/<name>/SKILL.md` の `disable-model-invocation: true`) や atomic skill (同 `.claude/skills/<name>/SKILL.md`、`disable-model-invocation` 設定なし or false) は、適用場面で **必ず明示起動する**。内容を読み流して検証コマンドを `pnpm xxx` で手打ちしても **起動の代替にはならない**。

特に以下は **コマンド手打ちでの代替を厳禁**:

| 起動が必須な skill | コマンド手打ちで代替できない理由 |
|---|---|
| `/dev-complete` (user-only orchestrator skill) | Step 1 で `self-review` **subagent を Agent dispatch**、Step 2-4 で docs-freshness / conventional-commits / github-flow を REQUIRED SUB-SKILL として連鎖呼出する設計 |
| `self-review` subagent | 検証コマンド + 「差分ファイルを新鮮な目で再読」「ツールで検出できない懸念探索」を独立 context で実施。親 context のバイアス排除が核心 |
| `/dev-start` (AI 可 orchestrator skill) | memory 検索 / Issue 確認 / branch 作成の orchestration。AI も自律起動可 (ADR-0024、stakes 低)、user `/dev-start <issue>` でも可 |
| `frontend-design` skill | Design Thinking (Tone / Differentiation / Constraints) の適用ガイド |

**Red Flag** (浮かんだら STOP):

- 「skill の内容は把握してるからコマンドだけで OK」 → 把握してても手順が抜ける、明示起動して checklist を毎回踏む
- 「docs / 軽微な変更だから self-review 軽くて OK」 → docs こそ grep カウント汚染等の落とし穴あり (FAIL-002)、重さは内容ではなく **省略を許さない態度** で決める
- 「`pnpm check:parallel` が pre-commit hook で走るから OK」 → hook は最後の砦であって self-review subagent dispatch の代替ではない、差分 re-read / paper tiger チェックは hook で代替できない
- 「task で `self-review` をマークしたから OK」 → タスク完了マークは記録、Agent tool での subagent dispatch が実行、両方必要

実装系タスクで TaskCreate を使う際は、**「user に `/dev-complete` を依頼」を独立タスクとして必ず切る** と起動行為が可視化されて省略しにくくなる。
