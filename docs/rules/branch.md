# branch

pla-stock の branch / PR / Issue 連携規約。github-flow + PR↔Issue 1:1。

## branch 命名

形式: **`<prefix>/#<issue>-<description>`**

- `<prefix>`: `.project-config.yml` の `branch.prefixes` enum (= `feat` / `fix` / `refactor` / `docs` / `chore` / `test`)
- `<issue>`: 関連 Issue 番号 (Issue 未作成なら先に作る)
- `<description>`: ケバブケース、簡潔に内容を表す

例: `docs/#111-multi-ssot-organization` / `feat/#167-allsettled-loader` / `fix/#155-view-purity-depcruise`

main / master への直接コミット禁止。編集前に必ず `git branch --show-current` で確認。

## github-flow + PR↔Issue 1:1

```
1. Issue を作成 (テンプレート使用、Type ラベル必須)
2. branch を切る (`<prefix>/#<issue>-<description>`)
3. 実装 + テスト + commit (Conventional Commits、詳細 commit.md)
4. PR 作成 (本文に `Closes #<issue>` 必須)
5. Review → QA → Merge
6. Issue 自動 close (Closes 経由)
```

**1 PR = 1 Issue** が原則。複数 Issue 混在は分割 (Subtask に分けて個別 PR)。

## Issue 階層 (詳細 [issue.md](./issue.md))

```
Epic (大きな機能単位)
  ├── Task (技術的な実装作業)        ← 基本 1 PR
  ├── Story (ユーザー視点の機能)      ← 基本 1 PR
  ├── Bug (不具合)                  ← 基本 1 PR
  └── Task (大きい場合)
       ├── Subtask                  ← 1 PR
       └── Subtask                  ← 1 PR
```

Epic → Task/Story/Bug は **sub-issue** で表現。Task 等が 2 PR 以上になりそうなら Subtask を作成。

## PR 規約

- **タイトル**: `type(scope): description` (Conventional Commits フォーマット、[commit.md](./commit.md) 参照、100 文字以内)
- **本文必須**:
  - Summary (3-5 行)
  - Test plan (検証項目チェックリスト)
  - `Closes #<issue>` (自動 close 用)
- **narrative は日本語**
- 1 PR = 1 Issue、複数混在は分割
- Review 結果は **PR 上にコメントで残す** (`gh pr comment`)。指摘 → 修正 → 修正内容を返信コメントで記録

## GitHub Projects カラム

| カラム | 説明 |
|---|---|
| Backlog | 未着手 |
| Ready | 着手可能 (依存解決済み) |
| In Progress | AI または人間が作業中 |
| Review | PR レビュー待ち |
| QA | 人間による動作確認 |
| Done | 完了 |

PR 作成 → Issue 自動 In Progress、PR merge → Issue 自動 Done (Closes 経由)。

## stacked PR

複数 PR を順序付きで積み上げる場合の運用は **Issue #146 で別途検討中** (squash merge 手順のルール化)。

## NG 例 / 対処

| NG | 理由 | 対処 |
|---|---|---|
| main に直 commit | 危険 | `/dev-start <issue>` で branch 作成 |
| 1 PR に複数 Issue 混在 | review 困難 | Subtask に分割、個別 PR |
| PR 本文に `Closes` なし | Issue 自動 close 効かず | `Closes #<issue>` を追記 (Refs だけだと close されない) |
| type ラベル付け忘れ | Projects 集計に影響 | `task`/`bug`/`story`/`epic`/`subtask` を必ず付与 |

## 関連

- skill: `github-flow` (本ファイルを読んで実行する orchestrator)
- command: `/dev-start <issue>` (branch 作成 orchestrator)
- 設定: `.project-config.yml` の `branch.prefixes`
- Issue テンプレート: `.github/ISSUE_TEMPLATE/`
- Issue 書き方詳細: [issue.md](./issue.md)
- commit message 詳細: [commit.md](./commit.md)
