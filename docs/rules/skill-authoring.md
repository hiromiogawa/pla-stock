# skill-authoring

pla-stock の skill / agent / rule 規約。orchestration only 原則 (ADR-0018) + commands→skills 統一 + stakes 別 user-only 判定 (ADR-0024)。

## 汎用 skill 規約は claude-handbooks plugin 参照

skill 作成 / 編集の汎用ルール (description 規約 / オーケストレーター規約 / 操作可能ルール原則 / 機械強制併設原則 / 本物 slash command パターン) は **`claude-handbooks:writing-skills` skill** に切り出した (ADR-0022)。新規 skill 追加・編集時はそちらを invoke して読む。本ファイルは pla-stock 固有の追加規約のみを定義する。

## 4 機構の役割 (ADR-0024 で skill 統一 + rules 追加)

| 機構 | 配置 | 種別 | 起動 |
|---|---|---|---|
| orchestrator skill (user-only) | `.claude/skills/<name>/SKILL.md` + `disable-model-invocation: true` | `/dev-complete` `/post-review` `/design-decision` `/rule-cycle` | user 入力のみ (儀式、AI auto-trigger 不可) |
| orchestrator skill (AI 可) | `.claude/skills/dev-start/SKILL.md` + `disable-model-invocation: false` | `/dev-start` | AI auto-trigger or user `/dev-start` (stakes 低) |
| atomic skill | `.claude/skills/<name>/SKILL.md` | 各種 | AI auto-trigger or user `/name` |
| path-scoped rules | `.claude/rules/<topic>-discipline.md` + `paths:` frontmatter | `ui-discipline` `db-discipline` | matching file 時のみ自動 load |
| subagent | `.claude/agents/<name>.md` | self-review / rule-* / project-bootstrap | Agent tool で dispatch (独立 context、Write tool は project-bootstrap のみ許可) |

## orchestrator skill の配置と stakes 別 user-only 判定 (ADR-0024)

5 orchestrator (`dev-start` / `dev-complete` / `post-review` / `design-decision` / `rule-cycle`) は **`.claude/skills/<name>/SKILL.md`** に配置 (commands と skills が unified mechanism のため、公式方向に追従)。

各 orchestrator の `disable-model-invocation` は **stakes 別に判定**:

| orchestrator | stakes | disable-model-invocation | 理由 |
|---|---|---|---|
| `dev-start` | 低 (branch 作成、undo 可) | `false` (AI 可) | friction 削減、`/dev-start <issue>` を AI が会話流れで自律起動 |
| `dev-complete` | 高 (commit + PR、irreversible) | `true` (user-only) | FAIL-002 防御、ceremony として保持 |
| `post-review` | 高 (commit 含む) | `true` (user-only) | dev-complete 連鎖 |
| `design-decision` | 中 (ADR file 作成、commit はまだ) | `true` (user-only) | judgment ceremony 価値 |
| `rule-cycle` | 中 (Issue 起票で外部 visible) | `true` (user-only) | signal value |

新規 orchestrator を追加する際は、stakes (失敗時の影響、irreversibility、external visibility) を基準に `disable-model-invocation` を決定する。

## path-scoped rules (.claude/rules/) の規約 (ADR-0024)

`.claude/rules/<topic>-discipline.md` は AI 動作規範 (rule) を path-scope で記述。orchestrator skill は手順 (skill) を記述。両者の役割:

- **rule**: 「該当 file を扱う時、これらの skill/orchestrator を経由しなさい」(規範)
- **skill**: 「具体的にどう手順を踏むか」(手順、orchestration only、規約本文は docs/rules/ 参照)

rule が orchestrator 起動を指示する場合 (例: `db-discipline.md` が mutation PR 前に smoke を指示)、user-only orchestrator (`/dev-complete` 等) は user 入力が必要、AI 可 orchestrator (`/dev-start`) は AI が自律起動可。

### 命名 convention

- `.claude/rules/<topic>-discipline.md` (suffix `-discipline` で `docs/rules/<topic>.md` (知識 SSoT) と区別)
- 既存例: `ui-discipline.md` / `db-discipline.md`

### global vs path-scope の判定基準 (ADR-0024)

「**特定 file 範囲を抽出できるか**」で判定:

- 抽出可 (例: src/views/**/*.tsx) → path-scope (`.claude/rules/`)
- 抽出不可 (例: main 直編集禁止、narrative 日本語) → global (CLAUDE.md)

## orchestration only 原則 (ADR-0018)

skill / agent / command は **規約本文を書かない**。規約は `docs/rules/` の該当 topic ファイル参照。

skill 本体に書くもの:

- AI 判断手順 (when to invoke / how to dispatch)
- AI 向け orchestration (sub-skill 連鎖、subagent dispatch、command 連鎖)
- 必要な `docs/rules/` への参照リスト (1 つでも複数でも可)
- AI 固有 Red Flag (一部は CLAUDE.md にも記載)

skill 本体に書かないもの:

- コミット規約の詳細 (→ `docs/rules/commit.md` 参照)
- テスト 9 ルールの本文 (→ `docs/rules/testing.md` 参照)
- linting ルールの詳細 (→ `docs/rules/linting.md` 参照)
- ... 他、人間も読む規約は docs/rules/ 側に書く

## skill フォーマット (公式 Claude Code 仕様)

```markdown
---
description: <skill が何をするか、いつ使うか。session 開始時 system-reminder に注入される>
argument-hint: <skill 引数 hint、command の場合>
---

# <skill name>

<skill 本文: orchestration 手順>

## いつ使うか
具体的な triggering 条件

## 実行フロー
Step 1: ...
Step 2: ...

## 参照する docs/rules/
- [topic-name](../../docs/rules/topic.md)

## Red Flag (AI 起動規律)
- (省略すべきでない場面の警告)
```

frontmatter は Claude Code 公式形式のみ (description / argument-hint)。自己参照的な metadata (`kind` / `subskills` / `subagents` / `trigger` 等) は #232 で除去済。

## subagent 特有

- 独立 context で実行 (親 context のバイアス排除)
- 親が prompt で必要情報を全て渡す (subagent は親 context を見ない)
- 出力は Markdown summary 形式 (`.claude/agents/<name>.md` の出力規約に従う)
- Write tool は **project-bootstrap のみ許可** (他は read-only、副作用は親が実行)

## user-only orchestrator skill 特有

- `.claude/skills/<name>/SKILL.md` + `disable-model-invocation: true` (ADR-0024、commands→skills 統一)
- user 明示 `/name` でしか起動できない (構造的不可逆性、AI auto-trigger 不可)
- 多段 orchestration の root として使う (子 skill / 子 subagent を REQUIRED SUB-SKILL として連鎖呼出)

## 廃止判定

使われていない skill (例: sdd) は **廃止 (skill ファイル削除)** を検討。廃止判定は `/rule-cycle` または skill audit (Issue #111) で実施。

廃止の代わりに「orchestration only に rewrite して残す」選択もある (使う見込みがあるが規約直書き状態の場合)。

## 関連

- 汎用 skill 規約 (公式 skill-creator delta): [`claude-handbooks:writing-skills`](https://github.com/hiromiogawa/claude-handbooks/blob/main/skills/writing-skills/SKILL.md)
- 設計経緯: ADR-0018 (SSoT 境界規約、orchestration only 原則)、ADR-0022 (claude-handbooks plugin 切り出し)、ADR-0024 (commands→skills 統一 + stakes 別 user-only + `.claude/rules/` 採用)、#227 (orchestrator → 本物 slash 化、ADR-0024 で supersede)、#188 (project-bootstrap subagent 化)、#232 (frontmatter metadata 完全削除)
- ハーネス俯瞰: `docs/harness-map.md`
- skill 一覧: CLAUDE.md「目次」節、`.claude/skills/` / `.claude/agents/` / `.claude/rules/` 配下 (`.claude/commands/` は ADR-0024 で skills に統合済、配下空)
- 廃止判定 issue: Issue #111 (本 PR で sdd 等を audit 中)
