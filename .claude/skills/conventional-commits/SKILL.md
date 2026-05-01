---
name: conventional-commits
description: Conventional Commits のコミットメッセージとブランチ名規約を定める（scope は `.project-config.yml` の scopes フィールドを参照）。Use when コミットメッセージを書くとき、ブランチを作成するとき、または type/scope/命名規則に迷ったとき
---

# Conventional Commits とブランチルール

コミットメッセージとブランチ名を機械可読なフォーマットに揃え、changelog 生成・scope フィルタ・Issue 紐付けを自動化可能にする。

## コミットフォーマット

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### タイプ

| タイプ | 使用場面 |
|--------|----------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `style` | フォーマット変更、ロジック変更なし |
| `refactor` | 修正でも追加でもないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルド、ツール、依存関係 |
| `perf` | パフォーマンス改善 |
| `ci` | CI 設定 |

### スコープ

パッケージ名またはモジュール名を使用。利用可能なスコープは `.project-config.yml` を参照。

### 破壊的変更

タイプ/スコープの後に `!` を付ける: `feat(kit)!: KitEvent の型を再設計`
またはフッターに `BREAKING CHANGE:` を記述。

### 例

```
feat(kit): キット追加 dialog を実装
fix(views): KitListView の filter state を初期化
docs(docs): ADR-NNNN を追加 (タイトル要旨)
chore(deps): MUI を v7.4 に更新
feat(kit)!: KitEvent の型を再設計
```

> 上は **pla-stock の `.project-config.yml` の scopes** に基づく具体例。実際の scope enum は `.project-config.yml` を参照（kit / paint / project / stock / shared / entities / features / widgets / views / routes / auth / nav / ui / infra / deps / ci / docs / tooling）。commitlint が `lint-config/commitlint-config.cjs` で同 enum を強制している。

## ブランチ命名

```
[prefix]/#[issue-number]-[short-description]
```

### プレフィックス

| プレフィックス | 使用場面 |
|---------------|----------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `chore` | メンテナンス、ツール |
| `docs` | ドキュメント |
| `refactor` | リファクタリング |

### 例

```
feat/#12-add-kit-dialog
fix/#15-kit-list-filter-state
docs/#20-adr-design-direction
```

## ツール

- **commitlint** と `@commitlint/config-conventional` — コミットメッセージを検証
- **husky** — `commit-msg` フックで commitlint を実行（本プロジェクトでは pnpm self-contained 化のため lefthook ではなく husky を採用）

## よくある間違い

| 間違い | 正しい |
|--------|--------|
| `feat: Add feature.` | 小文字始まり・ピリオドなし: `feat(scope): add feature` |
| `fix: fix bug` | scope を省略しない: `fix(kit): handle null input` |
| 破壊的変更を本文のみに書く | `!` または `BREAKING CHANGE:` フッターで明示 |
| `feat/add-memory` | Issue 番号必須: `feat/#12-add-memory` |
| 複数パッケージ変更を 1 コミット | scope を分けてコミット分割 |

## チェックリスト

コミット前の確認:
- [ ] メッセージが `type(scope): description` フォーマットに従っている
- [ ] スコープが有効なパッケージ/モジュールに一致している
- [ ] 説明は命令形、小文字、ピリオドなし
- [ ] 破壊的変更は `!` または `BREAKING CHANGE:` フッターで明示されている
- [ ] ブランチ名が `[prefix]/#[issue]-[description]` フォーマットに従っている
