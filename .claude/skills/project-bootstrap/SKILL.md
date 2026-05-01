---
name: project-bootstrap
description: .project-config.yml をもとに新リポジトリを dev-skills 標準（code-quality / conventional-commits / github-flow / sdd / docs-freshness）で初期化する。Use when 新しいリポジトリを作成し dev-skills 標準でブートストラップするとき
---

# プロジェクトブートストラップ

新プロジェクト開始時に以下のスキルを順序付きで実行する統括スキル。

## 前提条件

- `.project-config.yml` がプロジェクトルートに存在すること
- git が初期化されていること

## 実行順序

### フェーズ 1: コード品質セットアップ
**REQUIRED SUB-SKILL:** code-quality:
1. Biome 設定ファイル生成
2. OXLint 設定ファイル生成
3. knip 設定ファイル生成
4. dependency-cruiser 設定ファイル生成
5. Vitest 設定

### フェーズ 2: Git ワークフローセットアップ
**REQUIRED SUB-SKILL:** conventional-commits:
1. husky + lint-staged 設定（本プロジェクトでは lefthook ではなく husky を採用）
2. commitlint 設定
3. Git hooks インストール（`pnpm exec husky init` + `.husky/{pre-commit,pre-push,commit-msg}` 作成）

### フェーズ 3: GitHub セットアップ
**REQUIRED SUB-SKILL:** github-flow:
1. Issue テンプレート作成 (`.github/ISSUE_TEMPLATE/`)
2. GitHub Projects 設定（手動 or gh CLI）
3. ラベル作成

### フェーズ 4: ドキュメントセットアップ
**REQUIRED SUB-SKILL:** sdd:
1. `docs/specs/` ディレクトリ作成
2. typedoc 設定

**REQUIRED SUB-SKILL:** adr:
1. `docs/adr/` ディレクトリを作成（flat 構成、`NNNN-short-name.md` を直下に置く）
2. ファイル構成・命名規則の詳細は adr skill を参照

### フェーズ 5: CLAUDE.md
1. CLAUDE.md を生成（プロジェクト設定 + スキルへのポインタ + ドキュメント一覧）

## `.project-config.yml` テンプレート

下は **monorepo 例**（domain / infrastructure / interface に分ける構成）。値は **プロジェクトごとに書き換える前提** のテンプレ値。例えば single-package の domain ベース構成なら scopes は `[kit, paint, project, stock, ...]` のような具体ドメイン名になり、architecture.layers も別の表現になる。

```yaml
# Project-specific configuration values
# Referenced by skills for project-specific settings

project:
  name: my-project
  type: monorepo  # or single-package

coverage:
  minimum: 75
  target: 80

architecture:
  type: clean-architecture
  layers:
    domain: packages/core
    infrastructure:
      - packages/storage-postgres
    interface:
      - packages/mcp-server

scopes:
  - core
  - storage-postgres
  - mcp-server
```

## 確認事項

ブートストラップ後に確認:
- [ ] `pnpm lint` が通ること
- [ ] `pnpm test` が通ること（テストがまだない場合はOK）
- [ ] `pnpm knip` が通ること
- [ ] `pnpm dep-check` が通ること
- [ ] husky フックがインストールされていること（`.husky/` 配下にスクリプトが存在）
- [ ] Issue テンプレートが `.github/ISSUE_TEMPLATE/` に存在すること
- [ ] `docs/` の構造が作成されていること
- [ ] CLAUDE.md が正しいポインタで存在すること
