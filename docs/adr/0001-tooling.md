# ADR-0001: Phase B Tooling 採用

- ステータス: 承認
- 日付: 2026-04-28
- 関連: Epic #4

## 文脈

Phase A-2 完了に伴い、後続 Phase で増えるコード量に備えて lint / format / 静的解析 / git hook / commit lint を一括導入する。

## 決定

- Lint: oxlint (Rust 製で高速、ESLint より 50-100x 速い)
- Format: Biome (formatter only、lint は oxlint と被るため無効化)
- FSD layer: dependency-cruiser (`{shared,entities,features,widgets,views,routes}` の単方向依存を forbidden ルールで宣言)
- Dead code: knip (strict mode)
- Git hook: husky v9 + lint-staged
- Commit message: commitlint + config-conventional
- Vitest 等 testing tool は #42 ブラッシュアップで導入

## 結果

- pre-commit pipeline で lint/format/typecheck/depcruise/knip が走る
- FSD 違反・dead code は CI と pre-commit の両方で検出
- developer 体験は Rust 系ツールで <1s 級高速化

## 代替案

- ESLint: 速度の点で oxlint に劣る、pla-stock 規模では不要な複雑さ
- Prettier: Biome と機能重複、Rust 製の Biome 採用
- lefthook: husky の実績で十分
