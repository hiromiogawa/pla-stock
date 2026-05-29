---
name: dev-start
description: Issue に着手するとき、実装に入る前のコンテキスト準備 (memory 検索 → Issue 確認 → ブランチ作成 → 仕様確認) を統括する。AI auto-trigger 可 (stakes 低、ADR-0024)
disable-model-invocation: false
argument-hint: <issue-number>
---

# 開発開始

Issue に着手するとき、実装に入る前のコンテキスト準備を統括する。

**対象 Issue**: `$ARGUMENTS`

## いつ使うか

- Issue に着手するとき (「#NNN をやろう」「次の Issue に取り掛かる」)
- 作業内容が「複数ファイルの編集を伴う」と判明した時点 (Issue 未作成でも即座に起動)
- superpowers:brainstorming の前に実行する
- **AI も自律起動可** (ADR-0024、stakes 低 = branch 作成は undo 容易)

## 事前ガード: ブランチ確認

**編集を開始する前に必ず実行**。現在のブランチが `master` / `main` の場合、そのまま編集してはいけない。

```
git branch --show-current
```

master の場合は本 skill の Step 1-2 を必ず経由して feature ブランチに移る。

## 実行フロー

### Step 1: file memory でコンテキスト把握

実装判断の前に harness ファイル memory を確認する (インライン実行):

- memory ディレクトリの `MEMORY.md` (索引) を読む
- Issue のキーワード / 対象パッケージ名に関連する型別エントリ
  (`user`/`feedback`/`project`/`reference`) を開く

過去の設計判断は ADR (`docs/adr/`)、失敗事例は ADR-0007 を併せて確認する。

### Step 2: github-flow (Issue 確認・ブランチ作成)

**REQUIRED SUB-SKILL:** github-flow に従い:

1. Issue の内容を確認 (`gh issue view $ARGUMENTS`)
2. 関連 Issue があればリンクを確認
3. ブランチを作成 (命名規則: `[prefix]/#[issue]-[description]`、詳細 `docs/rules/branch.md`)

### Step 3: 仕様確認

Issue 本文の受け入れ条件を仕様として整理し、影響範囲を把握する:

1. Issue の受け入れ条件 / やること節を読む
2. 既存 ADR (`docs/adr/`) に関連する設計判断がないか確認
3. 既存 `docs/rules/` の該当 topic を読み、関連規約を把握
4. 必要なら `docs/specs/` に関連仕様があるか確認

### 完了条件

以下が揃った状態で brainstorming や実装に進む:

- [ ] 関連する記憶 (ファイル memory / ADR) を確認済み
- [ ] Issue の内容と受け入れ条件を把握済み
- [ ] **feature ブランチに切り替え済み** (master/main で作業していない)
- [ ] 関連 docs/rules/ ・ ADR を確認済み

## よくある間違い

| 間違い | 正しい対応 |
|--------|-----------|
| 「小さい変更だから」と master に直コミット | 小さくても feature ブランチ。Issue 未作成でも先にブランチを切る |
| Issue を作らずブランチだけ切る | ブランチ名に Issue 番号必須。先に Issue を作る |
| 編集開始後にブランチ確認を忘れる | 事前ガードの `git branch --show-current` を必ず実行 |
