# skill-authoring

pla-stock の skill / agent / command 規約。orchestration only 原則 (ADR-0018)。

## 3 機構の役割

| 機構 | 配置 | 種別 | 起動 |
|---|---|---|---|
| orchestrator command | `.claude/commands/<name>.md` | `/dev-start` `/dev-complete` `/post-review` `/design-decision` `/rule-cycle` | user 入力のみ (本物 slash command、AI auto-trigger 不可) |
| atomic skill | `.claude/skills/<name>/SKILL.md` | 各種 | AI auto-trigger or user `/name` |
| subagent | `.claude/agents/<name>.md` | self-review / rule-* / project-bootstrap | Agent tool で dispatch (独立 context、Write tool は project-bootstrap のみ許可) |

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

## command 特有

- 本物 slash command (`.claude/commands/<name>.md`)
- user 明示 `/name` でしか起動できない (構造的不可逆性、AI auto-trigger 不可)
- 多段 orchestration の root として使う (子 skill / 子 subagent を REQUIRED SUB-SKILL として連鎖呼出)

## 廃止判定

使われていない skill (例: sdd) は **廃止 (skill ファイル削除)** を検討。廃止判定は `/rule-cycle` または skill audit (Issue #111) で実施。

廃止の代わりに「orchestration only に rewrite して残す」選択もある (使う見込みがあるが規約直書き状態の場合)。

## 関連

- 設計経緯: ADR-0018 (SSoT 境界規約、orchestration only 原則)、#227 (orchestrator → 本物 slash 化)、#188 (project-bootstrap subagent 化)、#232 (frontmatter metadata 完全削除)
- ハーネス俯瞰: `docs/harness-map.md`
- skill 一覧: CLAUDE.md「目次」節、`.claude/skills/` / `.claude/agents/` / `.claude/commands/` 配下
- 廃止判定 issue: Issue #111 (本 PR で sdd 等を audit 中)
