---
name: writing-issues
description: GitHub Issue を Type 別 (Epic/Task/Story/Bug/Subtask) に日本語で起票する規約。本文構成・タイトル命名・親子紐付け・アンチパターンを定める. Use when 新規 Issue を立てる時、既存 Issue を整える時、Epic に sub-issue をぶら下げる時
---

# Issue 起票規約

このプロジェクトの GitHub Issue を**日本語で・Type 別に・親子関係を明示して**起票するための規約。`github-flow` skill の階層定義と CLAUDE.md の narrative-日本語ルールを前提に、**本文の書き方**に絞った delta を定める。

**REQUIRED BACKGROUND:** `github-flow` skill（Issue 階層 / ラベル / Projects）と `.github/ISSUE_TEMPLATE/*.yml` を先に確認すること。

## タイトル命名

`[Type] 簡潔な日本語タイトル` 形式。

| Type | 例 |
|---|---|
| Epic | `[Epic] Phase B: Lint / Test / dep-cruiser ツーリング基盤` |
| Task | `[Task] D1 binding を wrangler.jsonc に追加` |
| Story | `[Story] ユーザーがキットを在庫に追加できる` |
| Bug | `[Bug] /app/kits でフィルタが効かない` |
| Subtask | `[Subtask] biome.json を pla-stock 用に調整` |

- 動詞中心、40 字以内目安
- ファイル名・パスは入れない（本文で）
- Story は「ユーザーが〜できる」形で

## 本文構成（Type 別）

各 Type のテンプレートは `.github/ISSUE_TEMPLATE/*.yml` で field 定義済み。`gh issue create --template <type>` で起票する。フィールドの埋め方の指針：

### Epic
- **ゴール**: この Epic で達成する状態を 1-3 行
- **完了条件**: チェックボックスで列挙、外形的に検証できる粒度（例: `pnpm test が pass する`、`/app/kits で 一覧 / 詳細 / 追加 が動く`）
- **子 Issue**: sub-issue として後で追加。起票時は空でも、初稿で見えてる Task/Story を `- [ ] [Task] X` 形式で書き出しておくと議論が早い

### Task
- **親 Epic**: `#XX` 必須。親が無い独立 Task は稀（あれば理由を本文に）
- **やること**: 何を変えるか・どこを触るか
- **受け入れ条件**: 検証できる外形条件、3-7 個目安
- **技術メモ**: 設計判断・参考リンク・懸念点

### Story
- **親 Epic**: `#XX` 必須
- **ユーザーストーリー**: `As a [ロール] I want [動作] so that [価値]` 形式 or `[ロール]として[動作]したい、[理由]` 形式
- **受け入れ条件**: ユーザー動作で外形的に検証できる粒度

### Bug
- **何が起きたか**: 観察事実、感情・原因推測は分ける
- **期待動作**: 「こうあるべき」
- **再現手順**: 番号付きステップ
- **環境**: OS / Browser / version / git SHA

### Subtask
- **親 Task**: `#XX` 必須
- Task が 2+ PR になりそうな時のみ作る。安易に分けない

## 親子紐付け

GitHub の sub-issue 機能を使うか、本文で `Parent #XX` を明示する。

```bash
# 親 Issue に sub-issue として追加（gh sub-issue extension 必要）
gh issue edit <child-issue-num> --add-parent <parent-issue-num>
```

extension が無い環境では本文の `Parent` 欄 + 親 Issue 側の checklist で紐付け管理。

## ラベル

| ラベル | 付ける Type | 色 |
|---|---|---|
| `epic` | Epic | 赤 (#B60205) |
| `task` | Task | 青 (#0052CC) |
| `story` | Story | 緑 (#0E8A16) |
| `bug` | Bug | 橙 (#D93F0B) |
| `subtask` | Subtask | 水色 (#C5DEF5) |

`.github/ISSUE_TEMPLATE/*.yml` の `labels:` フィールドで自動付与される。手起票時は `--label` フラグで明示。

## PR との紐付け

- PR 1 本 = Issue 1 件。`Closes #XX` 必須（自動 close + Projects 自動 Done）
- 1 PR が複数 Issue にまたがるなら Subtask 分割を検討

## アンチパターン

| 症状 | 直し方 |
|---|---|
| タイトルが「修正」「改善」など漠然 | 動詞 + 対象を具体化（例: `[Task] /app/kits の grade フィルタを追加`） |
| 受け入れ条件が「動くこと」だけ | 外形検証できる粒度に分解（例: `grade=HG 選択時に HG のみが表示される`） |
| 親 Epic 未指定の Task が乱立 | Epic を先に立てるか、独立タスクなら親を空欄にした理由を本文に |
| 「TBD」「あとで決める」を起票時に放置 | 決まらない箇所はオプション。決まったら edit で追記 |
| ラベル付け忘れ | template 経由なら自動。手起票でも `--label` 必須 |
| Bug の再現手順なし | 「OS X / Chrome 130 で /app/kits を開く → エラー」レベルで最低 1 回再現 |
| Story を「実装する」目線で書く | ユーザー目線で書き直す（`As a ユーザー...`） |
| Subtask を 1 つしか持たない Task | Task 直接で十分。Subtask 化しない |

## gh コマンド早見

```bash
# Type を選んで起票（テンプレ経由、対話）
gh issue create --template task

# 一発起票（CI / スクリプト用）
gh issue create --title "[Task] X" --label task --body "..."

# 親付き起票
gh issue create --title "[Task] Y" --label task --body "Parent #12

## やること
..."

# 一覧
gh issue list --label epic
gh issue list --label task --state open
```
