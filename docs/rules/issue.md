# issue

pla-stock の GitHub Issue 書き方規約。Type 別 (Epic / Task / Story / Bug / Subtask) を日本語で起票。

## Type 別役割

| Type | 役割 | label | 親子関係 |
|---|---|---|---|
| **Epic** | 大きな機能単位 / プロジェクト | `epic` | 子に Task / Story / Bug を持つ |
| **Task** | 技術的な実装作業 | `task` | 基本 1 PR、Epic 配下 or 独立 |
| **Story** | ユーザー視点の機能 | `story` | 基本 1 PR、Epic 配下 |
| **Bug** | 不具合 | `bug` | 基本 1 PR、Epic 配下 or 独立 |
| **Subtask** | Task / Story / Bug が 2 PR 以上になる場合の分割 | `subtask` | 親 Task / Story / Bug 必須 |

## Issue テンプレート

`.github/ISSUE_TEMPLATE/` に各 Type 別の `.yml` テンプレートあり:

- `epic.yml` — ゴール / 完了条件 / 子 Issue 一覧
- `task.yml` — やること / 受け入れ条件 / 技術メモ
- `bug.yml` — 何が起きたか / 期待動作 / 再現手順 / 環境
- `story.yml` — ユーザーストーリー / 受け入れ条件
- `subtask.yml` — 親 Task / やること / 完了条件

Type ラベル (`epic` / `task` / `story` / `bug` / `subtask`) は **必ず付与**。GitHub Projects の集計に影響する。

## タイトル命名

形式: **`[Type] <要約>`** (日本語、簡潔に)

例:
- `[Epic] 開発基盤・品質改善 (ハーネス / コード品質 / CI 整理)`
- `[Task] 多重 SSoT 整理 (specs/plans/memory/CLAUDE.md/lint-config)`
- `[Bug] addKitEvent が出庫時に CHECK 制約で誤拒否`
- `[Story] ユーザーが設定画面で Clerk ログアウトできる`
- `[Subtask] kit 一覧にページネーション (loader + search param)`

## 本文構成

### Epic

```markdown
## ゴール
何を達成したいか (1-2 段落)

## 完了条件
- [ ] 子 Issue 1 完了
- [ ] 子 Issue 2 完了
- [ ] (...)

## 子 Issue
- #NNN [Task] ...
- #NNN [Story] ...

## 関連
- ADR-NNNN
- 関連 Issue / PR
```

### Task / Story / Bug

```markdown
## やること (Task / Subtask) または ユーザーストーリー (Story) または 何が起きたか (Bug)
具体的な作業内容 or 現象

## 受け入れ条件
- [ ] 条件 1
- [ ] 条件 2

## 技術メモ (任意)
実装方針 / 参照 ADR / 制約

## 関連
- 親 Epic: #NNN
- 関連 PR: #NNN
- 参照 ADR: ADR-NNNN
```

### Bug 追加項目

```markdown
## 期待動作
こうなるはず

## 再現手順
1. ...
2. ...

## 環境
- branch: main commit XXX
- ブラウザ: ...
```

## 親子紐付け

Epic → 子 Issue は GitHub の **sub-issue 機能** (Hierarchy) で紐付け。本文の「子 Issue」リストは見える化用。

Task が 2 PR 以上になる場合は **Subtask** を切る (Subtask は親 Task 必須、PR 1:1)。

## アンチパターン

| NG | 理由 | 対処 |
|---|---|---|
| Type ラベルなし | Projects 集計から漏れる | `task`/`bug`/`story`/`epic`/`subtask` を必ず付与 |
| Epic に直接 PR を紐付ける | Epic は集約用、進捗は子 Issue で | Task / Story / Bug を子に作って PR を紐付け |
| 1 Issue に複数 PR | 1:1 原則違反 | Subtask に分割 |
| タイトルに Type プレフィックスなし | 一覧で識別困難 | `[Task] ...` / `[Bug] ...` 形式必須 |
| 英語タイトル | narrative は日本語 | 日本語で書き直す |

## 関連

- skill: `writing-issues` (本ファイルを読んで Issue を組み立てる orchestrator)
- Issue テンプレート実体: `.github/ISSUE_TEMPLATE/`
- PR ↔ Issue 連携: [branch.md](./branch.md)
