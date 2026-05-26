---
name: adr
description: docs/adr/ に不変のアーキテクチャ決定記録（ADR）を作成・更新する。Use when 技術選定・アーキテクチャ変更・代替案比較の末に設計判断を下したとき、design-decision オーケストレーター外で単独記録する場合や既存 ADR を Supersede するとき
---

# ADR（アーキテクチャ決定記録）

重要な設計判断を、将来の自分やチームが「なぜこうなっているか」を辿れる形で不変に記録する。

## 作成タイミング

- 技術選定（ライブラリ、フレームワーク、DB等）
- アーキテクチャの重要な決定
- 代替案を検討した結果の判断
- 将来の自分やチームメンバーが「なぜこうなっているか」を知りたくなる決定

## ファイル構成

このプロジェクトは **flat 構成** (`docs/adr/NNNN-short-name.md`)。1 プロジェクト 1 連番、サブディレクトリは作らない。

```
docs/adr/
  0001-tooling.md
  0002-mui-emotion.md
  0003-tanstack-form-mui-pattern.md
  ...
```

> 補足: 大規模 monorepo で「root + packages/<pkg>/」のように分けるプロジェクトもあるが、本プロジェクトは単一パッケージのため flat に統一している。

## テンプレート

```markdown
# ADR-NNNN: タイトル

## ステータス
Proposed | Accepted | Deprecated | Superseded by ADR-NNNN

## コンテキスト
なぜこの決定が必要だったか。背景と制約条件。

## 決定
何を選んだか。具体的に。

## 選択肢

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| A      |         |          |
| B      |         |          |
| C      |         |          |

## 結果
この決定による影響。何が変わるか。
```

## 命名規則

`NNNN-short-description.md`（ファイル名は 4 桁 zero-pad の連番）
- 連番は `docs/adr/` 配下で 1 つに統一
- 中身の見出しは `# ADR-NNNN: 日本語タイトル` 形式（例: `# ADR-0005: Domain enum 集約規約`）
- 既存最大番号を `ls docs/adr/` で確認してから採番

## ルール

- ADR は **不変** — 変更する場合は新しい ADR で Supersede
- ステータスを更新して「Deprecated」or「Superseded by ADR-NNNN」にする
- コミット: `docs(docs): ADR-NNNN を追加 (タイトル要旨)` 形式（scope は `.project-config.yml` の `docs`）

## よくある間違い

| 間違い | 正しい対応 |
|--------|-----------|
| 既存 ADR を書き換える | ADR は不変。新 ADR で Supersede |
| 選択肢を比較せず結論だけ書く | 却下された代替案と理由こそ ADR の価値 |
| 番号重複 | 作成前に `ls docs/adr/` で既存最大番号を確認 |
| ADR 作成後に memory 保存を忘れる | brainstorming 中なら design-decision を使う |
